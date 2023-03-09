import {
	collection,
	onSnapshot,
	doc,
	setDoc,
	deleteDoc,
	getCountFromServer,
	updateDoc,
	query,
	where,
	getDocs,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from './config';
import { getFutureDate, getDaysBetweenDates } from '../utils';
import { calculateEstimate } from '@the-collab-lab/shopping-list-utils';

/**
 * Return whether a collection has documents in it (list token exists) or is empty (list token does not exist)
 * @param {string} listId the listId that a user submitted to join a list
 * @returns {boolean}
 */
export async function doesCollectionExist(listId) {
	const listCollectionRef = collection(db, listId);
	const testSnapshot = await getCountFromServer(listCollectionRef);
	return testSnapshot.data().count !== 0;
}

/**
 * Log user in anonymously using firebase authentication to allow CRUD operations in database
 * Firebase docs do not specify behavior, but via testing:
 * it looks like this creates a new anonymous user if user doesn't already have one, or if user already exists nothing changes
 * Firebase appears to store/manage user data in user's browser for us
 */
export async function anonymouslyLogInUser() {
	try {
		await signInAnonymously(auth);
	} catch (err) {
		console.log(err);
	}
}

/**
 * Subscribe to changes on a specific list in the Firestore database (listId), and run a callback (handleSuccess) every time a change happens.
 * @param {string} listId The user's list token
 * @param {Function} handleSuccess The callback function to call when we get a successful update from the database.
 * @returns {Function}
 *
 * @see https://firebase.google.com/docs/firestore/query-data/listen
 */
export function streamListItems(listId, handleSuccess) {
	const listCollectionRef = collection(db, listId);
	return onSnapshot(listCollectionRef, handleSuccess);
}

/**
 * Read the information from the provided snapshot and return an array that can be stored in our React state.
 * @param {Object} snapshot A special Firebase document with information about the current state of the database.
 * @returns {Object[]} An array of objects representing the user's list.
 */
export function getItemData(snapshot) {
	// Firebase document snapshots contain a `.docs` property that is an array of document references.
	// We use `.map()` to iterate over them. @see https://firebase.google.com/docs/reference/js/firestore_.documentsnapshot
	const arrayFromFirestore = snapshot.docs.map((docRef) => {
		// call the `.data()` method to get the data out of the referenced document
		const data = docRef.data();

		// The document's ID is not part of the data, but it's very useful so we get it from the document reference.
		data.id = docRef.id;

		return data;
	});

	// filter the data from firebase to remove the hidden placeholder value
	const filteredArray = arrayFromFirestore.filter(
		(doc) => doc.hidden === false || doc.hidden === undefined,
	);

	return filteredArray;
}

/**
 * @param {array} itemArray the array of items to be sorted
 * @returns {array} a reference to the array now sorted
 * Will have all inactive items last, then sorted by days until next purchase, and items with same days sorted alphabetically
 */
export function comparePurchaseUrgency(itemArray) {
	// split array to active and inactive, sort both, join back together and return
	let today = new Date();

	let activeArray = itemArray.filter(
		(item) =>
			item.dateLastPurchased === null ||
			getDaysBetweenDates(today, item.dateLastPurchased.toDate()) < 60,
	);
	let inactiveArray = itemArray.filter(
		(item) =>
			item.dateLastPurchased !== null &&
			getDaysBetweenDates(today, item.dateLastPurchased.toDate()) >= 60,
	);

	activeArray = sortByDaysUntilNextPurchase(activeArray);
	inactiveArray = sortByDaysUntilNextPurchase(inactiveArray);

	return activeArray.concat(inactiveArray);
}

/**
 * @param {array} itemArray the array of items to be sorted
 * @returns {array} a reference to the array now sorted
 * Will be sorted with all by days until the item is expected to be purchased, with same number of days sorted alphabetically
 */
function sortByDaysUntilNextPurchase(itemArray) {
	let today = new Date();

	itemArray.sort((a, b) => {
		let aDays = getDaysBetweenDates(a.dateNextPurchased.toDate(), today);
		let bDays = getDaysBetweenDates(b.dateNextPurchased.toDate(), today);

		if (aDays < bDays) return -1;
		if (aDays > bDays) return 1;
		return a.name.localeCompare(b.name);
	});

	return itemArray;
}

/**
 * Add a new item to the user's list in Firestore.
 * @param {string} listId The id of the list we're adding to.
 * @param {Object} itemData Information about the new item - destructured to access the item's name (string)
 * the days until the user expects to purchase the item again (integer) and whether this is a hidden item (boolean / undefined)
 */
export async function addItem(
	listId,
	{ itemName, daysUntilNextPurchase, hidden },
) {
	const listCollectionRef = collection(db, listId);

	// if hidden property exists (placeholder item) set isHidden to true, otherwise false (all other items)
	const isHidden = hidden !== undefined ? true : false;

	try {
		await setDoc(doc(listCollectionRef), {
			dateCreated: new Date(),
			// NOTE: This is null because the item has just been created.
			dateLastPurchased: null,
			dateNextPurchased: getFutureDate(daysUntilNextPurchase),
			name: itemName,
			totalPurchases: 0,
			hidden: isHidden,
		});
		return { success: true };
	} catch (error) {
		return { success: false, error: JSON.stringify(error.message) };
	}
}

/**
 * @param {String} listToken the list token that corresponds to a Firebase collection
 * @param {Object} itemData the object containing all of the current data for this item from our app's state (destructured in implementation)
 */
export async function updateItem(
	listToken,
	{ id, dateLastPurchased, dateNextPurchased, dateCreated, totalPurchases },
) {
	// get current date, the last estimated interval, days since last transaction, and increment total purchases
	const today = new Date();
	const lastEstimatedInterval =
		dateLastPurchased === null
			? getDaysBetweenDates(dateNextPurchased.toDate(), dateCreated.toDate())
			: getDaysBetweenDates(
					dateNextPurchased.toDate(),
					dateLastPurchased.toDate(),
			  );
	const daysSinceLastTransaction =
		dateLastPurchased === null
			? getDaysBetweenDates(today, dateCreated.toDate())
			: getDaysBetweenDates(today, dateLastPurchased.toDate());
	const newTotalPurchases = totalPurchases + 1;

	// calculate the estimated days until item should be purchased again
	const daysUntilNextPurchase = calculateEstimate(
		lastEstimatedInterval,
		daysSinceLastTransaction,
		newTotalPurchases,
	);

	// get reference to the item's document in Firestore
	const itemDocRef = doc(db, listToken, id);

	// set dateLastPurchased to current date, incrememt totalPurchases
	await updateDoc(itemDocRef, {
		dateLastPurchased: today,
		totalPurchases: newTotalPurchases,
		dateNextPurchased: getFutureDate(daysUntilNextPurchase),
	});
}

/**
 * @param {String} listToken the list token that corresponds to a Firebase collection
 * @param {String} id the document id for the item to be deleted
 */
export async function deleteItem(listToken, id) {
	await deleteDoc(doc(db, listToken, id));
}

/**
 * @param {String} listToken the list token that corresponds to a Firebase collection
 * Finds the hidden item in the database and updates it's date next purchsed to 1 day in the future to trigger a data refresh
 */
export async function refreshData(listToken) {
	const q = query(collection(db, listToken), where('hidden', '==', true));
	const querySnapshot = await getDocs(q);

	let hiddenId;
	querySnapshot.forEach((doc) => {
		hiddenId = doc.id;
	});

	const hiddenDocRef = doc(db, listToken, hiddenId);

	await updateDoc(hiddenDocRef, {
		dateNextPurchased: getFutureDate(1),
	});
}
