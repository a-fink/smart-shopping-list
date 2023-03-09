import { useEffect, useState } from 'react';
import {
	Navigate,
	BrowserRouter as Router,
	Routes,
	Route,
} from 'react-router-dom';
import { AddItem, Home, Layout, List } from './views';
import {
	getItemData,
	streamListItems,
	comparePurchaseUrgency,
	anonymouslyLogInUser,
} from './api';
import { useStateWithStorage } from './utils';

export function App() {
	// anytime the app loads, anonymously log in the user
	anonymouslyLogInUser();

	const [data, setData] = useState([]);

	// Using a custom hook to create `listToken` and a function that can be used to update `listToken` later.
	// listToken is null by default since new users will not have tokens
	const [listToken, setListToken] = useStateWithStorage(
		null,
		'tcl-shopping-list-token',
	);

	useEffect(() => {
		if (!listToken) return;

		// streamListItems` takes a `listToken` to commuinicate with database,
		// then calls a callback function with a `snapshot` from the database. Refer to `api/firebase.js`.
		return streamListItems(listToken, (snapshot) => {
			// Read the documents in the snapshot and do some work on them, so we can save them in our React state. Refer to `api/firebase.js`
			const nextData = getItemData(snapshot);

			// sort the data received from Firebase by our default sort
			const nextDataSorted = comparePurchaseUrgency(nextData);

			setData(nextDataSorted);
		});
	}, [listToken]);

	return (
		<Router>
			<Routes>
				<Route path="/" element={<Layout listToken={listToken} />}>
					{listToken ? (
						<Route index element={<Navigate to="/list" />} />
					) : (
						<Route index element={<Home setListToken={setListToken} />} />
					)}
					<Route
						path="/list"
						element={<List data={data} listToken={listToken} />}
					/>
					<Route
						path="/add-item"
						element={<AddItem listToken={listToken} data={data} />}
					/>
				</Route>
			</Routes>
		</Router>
	);
}
