# Squad-Finder-API

Contributers: Jaya DeHart, David Whitmore, Jessica Parker, Rachael Rice, Gina Hobbs

## Version 1.0.0

### Change Log

0.0.1 - 9/10/2021 - scafold of repo created

1.0.0 - 9/15/2021 - MVP. All planned routes are working.

## Description

Sometimes you want to play your favorite video game, but you have noone to play with. This app wil help you find your squad and play the games you love in a team environment!

## Routes

### Authentication

- POST /signup - create a user profile witha username and password as strings.

  - Your password will not be saved to the DB. It is encrypted before being saved for your protection

- POST /signin - Pass in a username and a password for an account that has already been created. Uses basic auth practices to verify your identiy and log you in.

### Profile routes

- all routes use bearer authentication middleware that requires you to be signed in.

- POST /profile - takes in a body object of a bio(string) and a game(s) which are from a set list (Madden, Fortnite, Minecraft, League of Legends for now) and creates a new record in the database for the logged in user with that info.

  - this list will eventually be displayed on a UI as a dropdown menu to be selected from.

- GET /profile - returns the profile data fro the signed in user.

- PUT /profile - takes in a body object that can have bio or game names (from the above list) and will update the signed in user's profile on the database.

- DELETE /profile - allows for the removal of the logged in user's profile from the database.

### Achievement routes

- all routes use bearer authentication middleware that requires you to be signed in.

- POST /achievements - takes in an object with game(string), rank(string), progress(string), lastplayed(date). Then creates a record in the database with that info.

  - each game must be unique and should align with the games on the user's profile.

- GET /achievements - returns the database record of achievements for the signed in user.

- GET /achievements/:id - returns the database record of the specific achievement record based on the id from the route parameter.

- PUT /achievements/:id - returns the updated record of the signed in user's achievements. Takes an object matching the above mentioned schema for input.

- DELETE /achievements/:id - allows for deletion of a specific achievement from the database as long as the signed in user is the owner of the achievement.

### Friends routes

- all routes use bearer authentication middleware that requires you to be signed in.

- GET /users - returns all current users.

  - this route is intended to be used on the UI to populate a search page to find new squad mates.
  - this route does not have bearer authentication associated with it but the potential page on a ui would be blocked behind a login requirement.

- GET /friendRequests - returns all current friend request for the signed in user.

- DELETE /friendRequests/:id - removes the selected friend request from the database. Selection is based on the route parameter id. This id is the id of the user that made the request.

- POST /friends/:id - adds a friend to the database between the logged in user and user of the id from the route parameter.

  - this will also delete the friend request from the database.
  - the route parameter should be for a user that has already made a request.

- POST /friendRequests/:id - add a friend request to the database between the logged in user and the user whose id is specified in the route parameter.

- GET /friends - returns a lost of the friends for the logged in user.

- DELETE /friends/:id - removes the record from the database for the friend relationship between the logged in user and the user specified by the route paramete.

- DELETE /friendRequests/:id - removes the record from the database for the friend request between the logged in user and the user specified inthe route parameter.

### Squad routes

- all routes use bearer authentication middleware that requires you to be signed in.

- POST /squads - creates a squad in the database with the logged in user as the 'creator' and the list of passed in users as the members.

  - the list must be the ID's of the users and that will have to be managed by the UI.
  - this route uses a junction table and creates associations for each user to the squad on that table.

- GET /squads - returns all the squads (with all members) for the logged in user.

- DELETE /squads - removes a associations for all members to a given squad from the database. Must have a squad ID bassed in on the request body.
