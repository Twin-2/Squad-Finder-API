# Requirements

## Software Requirements:

- Node.js @14.17.0
- Express @4.17.1
- Cors @2.8.5
- Bcrypt @5.0.1
- Base-64 @1.0.0
- Jason Web Token @8.5.1
- Sqlite3 @6.0.1
- Sequelize @6.6.5

## API Requirements:

- Feedspot
- IGDB: Video Game Database

## Vision:

Application will serve as a social media platform for video gamers to find friends and connect with new players.
Application provides a user-friendly cross-platform centralized gaming community space to manage social connection.
Social media is a $62.5bn industry and Video Gaming is a $90bn industry. There is a social media need for new and engaging community spaces that combine both industries, and the monetization potential is high.

## Scope (IN/OUT) and Functional Requirements:

**IN**

Project Will: 

- Allow users to login/logout of their individual profiles.
- Allow users to perform CRUD actions on their profile information.
- Allow users to join and find squadsmates.
- Allow users to perform CRUD routes on their friends list.
- Allow users to leave squads (Delete route).
- Pull RSS API response if a user is not logged in.

**OUT**

Project Will Not:

- Allow users to automatically join console/PC games from application.

## Stretch Goals:

- SNS notifications to users when they receive a new friend request.
- Squad chatroom/ message board.
- Page to browse game titles/info.
- AWS/DynamoDB integration.

## User Stories:

### Profile

1. As a user, I want to be able to edit my user profile Bio and liked games

2. Feature Tasks

	- put, post, delete routes to the user data table

3. Acceptance Tests

	- Be able to edit the table on the database 


### Signup

1. As a user, I want to be able to create an account

2. -create a sign in route

	-create a user data model and method of persistence

	-create a route handler that connects everything 

3. Acceptance Tests

	-Should be able to sign up and get correct status code / response
  
  
 ### Leave Squad

1. As a user, I want to be able to leave a squad

2. Feature Tasks

	- delete route to remove the user from the list of squad members

3. Acceptance Tests

	- hit the route, remove from the database
	- 

### Find Team

1. User Story:

As a user I want to find friends who have the same games that I have on my profile.

2. Feature Tasks:

-create a route that searches the DB for users that have the same game as the one selected in the dropdown.

3. Acceptance Tests:

- should be able to return the data


### News Feed

1. As a user, I want to see a news feed page when I first go to the page, and when I first sign in be sent to that page.

2. Feature Tasks

	- create a home route that returns info from a game news API. 

3. Acceptance Tests

	- hit the route, show news feed

### See Friends

1. As a user I want to be able to see all the other gamers I've connected with and the squads I have built.

2. Feature Tasks:

	- create a route that pulls all friends/matches off your profile

	- create a route that shows all the squads for each game

3. Acceptance Tests

	- should be able to go to the two routes and return the appropriate data


## Trello Board Link

https://trello.com/b/3XoPbjkP/401-mid-term

## UML / Whiteboard Diagram

TBD
