# Smart Shopping List

## Live Site

[Live Site](https://afink-smart-shopping-list.netlify.app/list)

## Development Team

This project was built as part of the [The Collab Lab's](https://the-collab-lab.codes/) program for early-career developers, by the TCL-51 cohort.

### Cohort Participants

- [Alejandro Rojas](https://github.com/kmachappy) 🐈‍
- [Aubrey Finkelstein](https://github.com/a-fink/) 🦉
- [Amanda DiNoto](https://github.com/Amanda2900) ⛄️
- [Amy Stanley](https://github.com/ameliasheppy) 🐾

### Mentors

- [Grace de la Mora](https://github.com/thetrend) 🎉
- [Devin Jaggernauth](https://github.com/mentalcaries) 👻
- [Luis Augusto](https://github.com/luisaugusto) 🚀

### Code of Conduct Contacts

- [Stacie Taylor](https://github.com/stacietaylorcima) 🙌

## Features

- Users can create a shopping list which will learn their buying habbits
- The list predicts when a user will next need to buy each item and provides status indicators
- Users can share their list with others such as a friend or family member using a 3-word token

## Built with

![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white) Firebase ![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Netlify](https://img.shields.io/badge/netlify-%23000000.svg?style=for-the-badge&logo=netlify&logoColor=#00C7B7)

## Planned Future Improvements

- Add a manual toggle switch for light and dark mode
- Allow users to edit item names
- Allow users to manually change the next purchase date estimate for items
- Allow users to uncheck an item that was marked as purchased
- Give users a way to delete their list token from local storage so they can start/join another list (does not delete list in database)
- Give users the option to delete their list entirely (delete from app & database)
- Automate clearing old/inactive lists from the database
- Manage the edge case where a user clearning their logins but not their local storage will require a refresh before they can access the database again

## Running the Project Locally

1. Clone the project from GitHub
2. cd into the project directory in your terminal and run `npm install` to install the dependencies

- **Note:** This project requires the latest Long Term Support (LTS) version of Node (18)

3. Set up a project/app in your Firebase account and replace the configuration details in `/src/api/config.js` with your own configuration details

- **Note** This project requires Firestore database, and Firebase Auth services, with the Anonymous sign-in provider enabled in Auth

4. Run `npm start` to run the app locally in development mode. You can view the site at http://localhost:3000 in your browser
