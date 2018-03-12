Grammar Guru
-------------------------------------------------------------------------------------------------------------
In class assignment for web applicatioins class.

-This assingment is a simple game of hangman running on a nodejs express instance.
-New games are created using Metadata on hte server that populates the client side. This allows default rules
 to be changed server side while not affecting the client side.
-Player can pick from one of three difficulties and have their input displayed in one of 5 different fonts.
 --Anyone who forks this can add their own fonts as well in the metadata and it should work just fine.
-Express and nodejs 9.0 have to be installed to use this as well as uuid to make this program run.
 --set to run on port 3000
-supports a game-view mode and game-selection mode where game-view is a modal that slides up allowing a user
 to play one game without looking at any other options in the previous menu.
-Games can be left and returned to at any point allowing for multiple games to be going at one time.
-this server app uses bootstrap and JQuery

!! IMPORTANT NOTES !!
-This application currently uses MongoDB and only supports 3 users. 
 -As per the professor request, new users are unable to be created and sign-ins are only done through one of three possible users
	1. email: bilbo@mordor.org , password:123123123
	2. email: frodo@mordor.org , password: 234234234
	3. email: samwise@mordor.org, password: 345345345

-Games can be created for each user but they cannot be deleted. Default values for the color, difficulty, and font are changed upon pressing 
 the "change defaults" button and will be present upon logging out and logging back in
-This application uses session id's and cookies that expire after 10 minutes. After that performing an action will send the user to the login screen
