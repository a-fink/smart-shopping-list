# The shopping list API

## Overview

The `firebase.js` file contains all of the functions that communicate with the Firestore database and Firebase Auth. Think of it as the home base for the shopping list API. React components that need to communicate with the Firestore database / auth services should import a function defined here; they should _never_ import any modules in the `firebase/firestore` or `firebase/auth` package directly.

## The API functions

### `doesCollectionExist`

This function takes the listId (id of a collection in Firestore). It checks to see if the collection contains any documents (exists) or is empty (does not exist) and returns the boolean result.

| Parameter | Type     | Description               |
| --------- | -------- | ------------------------- |
| `listId`  | `string` | The list we are checking. |

### `anonymouslyLogInUser`

This triggers Firebase Auth to create/sign in an anonymous user. This is done to add an additional layer of security to our Firestore database so only authorized users can read/write data.

### `streamListItems`

Subscribe to changes on a specific collection in the firestore database, and run a callback function on the data any time a change occurs.

| Parameter       | Type       | Description                                                  |
| --------------- | ---------- | ------------------------------------------------------------ |
| `listId`        | `string`   | The list we are watching                                     |
| `handleSuccess` | `Function` | The callback function to use when we get a successful update |

### `getItemData`

Read the information from the provided Firebase snapshot, filter out the hidden placeholder, and return an array of list item information we can use in our app's state.

| Parameter  | Type     | Description                                                                          |
| ---------- | -------- | ------------------------------------------------------------------------------------ |
| `snapshot` | `Object` | a special Firebase document with information about the current state of the database |

### `comparePurchaseUrgency`

In conjunction with the `sortByDaysUntilNextPurchase` helper function, sort the list items with inactive items last, then in order by days until next expected purchase, with ties broken by sorting alphabecially.

| Parameter   | Type    | Description                                          |
| ----------- | ------- | ---------------------------------------------------- |
| `itemArray` | `array` | the array of items in our list that should be sorted |

### `sortByDaysUntilNextPurchase`

This function is used by `comparePurchaseUrgency` to sort the active/inactive arrays in place once they have been split.

| Parameter   | Type    | Description                     |
| ----------- | ------- | ------------------------------- |
| `itemArray` | `array` | the array of items to be sorted |

### `addItem`

This function takes user-provided data and uses it to create a new item in the Firestore database.

| Parameter  | Type     | Description                                                                                                                                      |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `listId`   | `string` | The list to which this item will be added.                                                                                                       |
| `itemData` | `Object` | An object containing user input informaiton about the item, destructured to access item name, estiamted days until purchase, and hidden property |

#### Note

**`daysUntilNextPurchase` is not added to the item directly**. It is used alongside the `getFutureDate` utility function to create a new _JavaScript Date_ that represents when we think the user will buy the item again.

### `updateItem`

Takes a list token and the current state of an item from the list. Calculates the next estimated purchase date based on the current data of the item. Updates the date last purchsed, estiamted date next purchased, and total number of purchases in the database.

| Parameter   | Type     | Description                                                                                                                       |
| ----------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `listToken` | `string` | The list to which this item will be added.                                                                                        |
| `itemData`  | `Object` | An object containing the items current information, destructured to access multiple properties needed for calculations / updating |

#### Note

**`daysUntilNextPurchase` is not added to the item directly**. It is used alongside the `getFutureDate` utility function to create a new _JavaScript Date_ that represents when we think the user will buy the item again.

### `deleteItem`

Takes a list token and the id of an item and deletes that item from the Firestore database.

| Parameter   | Type     | Description                      |
| ----------- | -------- | -------------------------------- |
| `listToken` | `string` | The list we are using            |
| `id`        | `string` | The id of the item to be deleted |

### `refreshData`

Takes a list token, find the hidden item in that list, and updates its dateNextPurchased to one day in the future in order to trigger a database update and stream refreshed data back to our app.
| Parameter | Type | Description |
| -------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `listToken` | `string` | The list we are using

#### Note

**One day is not added to the item directly**. It is used alongside the `getFutureDate` utility function to create a new _JavaScript Date_ that represents the date and time one day from now.

## The shape of the the data

When we request a shopping list, it is sent to us as an array of objects with a specific shape – a specific arrangeement of properties and the kinds of data those properties can hold. This table describes the shape of the items that go into the shopping list.

| Property            | Type      | Description                                                       |
| ------------------- | --------- | ----------------------------------------------------------------- |
| `dateCreated`       | `Date`    | The date at which the item was created.                           |
| `dateLastPurchased` | `Date`    | The date at which the item was last purchased.                    |
| `dateNextPurchased` | `Date`    | The date at which we expect the user to purchase this item again. |
| `hidden`            | `boolean` | Whether this is the hidden placeholder item                       |
| `name`              | `string`  | The name of the item.                                             |
| `totalPurchases`    | `number`  | The total number of times the item has been purchased.            |
