require('dotenv').config({ override: true, path: `${__dirname}/credentials.env` });
const { MongoClient } = require('mongodb');
const express = require('express')
const jwt = require('jsonwebtoken');
var cors = require('cors');
const app = express();
var expressWs = require('express-ws')(app);
const port = 3001;

async function main() {
    const client = new MongoClient(process.env.MONGO_URI);
    const gameCollection = client.db("Game").collection("Games");
    const userCollection = client.db("Game").collection("Users");
    const socketMap = new Map();

    const secretKey = process.env.SECRET_KEY;

    //enable cors at specified origin
    app.use(cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }));

    //initialize json
    app.use(express.json())

    
    try {
        await client.connect();
        await listDatabases(client);
    }catch (e) {
        console.error(e);
    }finally {
        
    }





    app.listen(port, () => {
        console.log("Server Listening on PORT:", port);
    });

    app.ws('/ws', async (socket, req) => {
        socketInfo = {
            gameName: "",
            gameType: "",
            session_id: ""
        }
        socket.on('message', async (message) => {
            try {
                jsonmessage = JSON.parse(message);
                console.log(`Recieved message from client ${JSON.stringify(jsonmessage)}`);

                if (jsonmessage.gameType == 'tictactoe') {
                    if (jsonmessage.type == 'makeMove') {
                        console.log('trying to make move');
                        console.log("socketmap size: " + socketMap.size)
                        const gameData = await findGameByName(gameCollection, jsonmessage.gameName);

                        await tictactoeMakeMove(gameCollection, gameData, jsonmessage.message[0], jsonmessage.message[1])
                        const win = tictactoeCheckForWin(await findGameByName(gameCollection, jsonmessage.gameName));
                        if (win.winner != 'e') {
                            const moveMessage = {
                                type: "update",
                                game: await findGameByName(gameCollection, jsonmessage.gameName)
                            }
                            broadcastGame(socketMap, socketInfo.gameName, moveMessage)

                            const winMsg = {
                                type: "winner",
                                winner: win.winner
                            }

                            broadcastGame(socketMap, socketInfo.gameName, winMsg)
                        } else {
                            const moveMessage = {
                                type: "update",
                                game: await findGameByName(gameCollection, jsonmessage.gameName)
                            }
                            broadcastGame(socketMap, socketInfo.gameName, moveMessage)
                        }





                    }
                    if (jsonmessage.type == 'connectGame') {
                        const game = await findGameByName(gameCollection, jsonmessage.gameName)
                        const moveMessage = {
                            type: "update",
                            game: game
                        }
                        socketInfo.gameName = jsonmessage.gameName;
                        socketInfo.gameType = jsonmessage.gameType;
                        socketInfo.session_id = jsonmessage.session_id;
                        socketMap.set(socket, socketInfo);
                        if (game == null) {
                            await createGame(gameCollection, generateGame(socketInfo.gameType, socketInfo.gameName));
                            await addUserToGame(gameCollection, socketInfo.gameName, socketInfo.session_id, "x");
                            const response = {
                                type: "success",
                                side: 'x'
                            }
                            broadcastGame(socketMap, socketInfo.gameName, {
                                type: "update",
                                game: await findGameByName(gameCollection, socketInfo.gameName),
                            })
                            socket.send(JSON.stringify(response));
                        } else if (game && game.gameType == "tictactoe" && game.o == null && game.x != socketInfo.session_id) {
                            await addUserToGame(gameCollection, socketInfo.gameName, socketInfo.session_id, "o");
                            const response = {
                                type: "success",
                                side: "o"
                            }
                            broadcastGame(socketMap, socketInfo.gameName, moveMessage)
                            socket.send(JSON.stringify(response));
                        } else if (game.x == socketInfo.session_id) {
                            const response = {
                                type: "success",
                                side: "x"
                            }
                            broadcastGame(socketMap, socketInfo.gameName, moveMessage)
                            socket.send(JSON.stringify(response));
                        } else if (game.o == socketInfo.session_id) {
                            const response = {
                                type: "success",
                                side: "o"
                            }
                            broadcastGame(socketMap, socketInfo.gameName, moveMessage)
                            socket.send(JSON.stringify(response));
                        } else if (game.o != null && game.x != null) {
                            const response = {
                                type: "error",
                                error: "GAME_FULL"
                            }
                            socket.send(JSON.stringify(response));
                            console.log("gf");
                        } else {

                        }





                    }

                } else if (jsonmessage.gameType == 'checkers') {//checkers
                    console.log('ct');
                    if (jsonmessage.type == 'makeMove') {
                        console.log('trying to make move');
                        console.log("socketmap size: " + socketMap.size)
                        const gameData = await findGameByName(gameCollection, jsonmessage.gameName);
 
                        await checkersMakeMove(gameCollection, jsonmessage.message, gameData);
                        const win = {
                            winner: await checkerCheckForWin(gameCollection, jsonmessage.message)
                        };
                        //await tictactoeMakeMove(gameCollection, gameData, jsonmessage.message[0], jsonmessage.message[1])
                        //const win = tictactoeCheckForWin(await findGameByName(gameCollection, jsonmessage.gameName));
                        if (win.winner != 'e') {
                            const moveMessage = {
                                type: "update",
                                game: await findGameByName(gameCollection, jsonmessage.gameName)
                            }
                            broadcastGame(socketMap, socketInfo.gameName, moveMessage)

                            const winMsg = {
                                type: "winner",
                                winner: win.winner
                            }

                            broadcastGame(socketMap, socketInfo.gameName, winMsg)
                        } else {
                            const moveMessage = {
                                type: "update",
                                game: await findGameByName(gameCollection, jsonmessage.gameName)
                            }
                            broadcastGame(socketMap, socketInfo.gameName, moveMessage)
                        }





                    }
                    if (jsonmessage.type == 'connectGame') {
                        console.log('checkCG');
                        const game = await findGameByName(gameCollection, jsonmessage.gameName)
                        console.log(game);
                        const moveMessage = {
                            type: "update",
                            game: game
                        }
                        socketInfo.gameName = jsonmessage.gameName;
                        socketInfo.gameType = jsonmessage.gameType;
                        socketInfo.session_id = jsonmessage.session_id;
                        socketMap.set(socket, socketInfo);
                        if (game == null) {
                            await createGame(gameCollection, generateGame(socketInfo.gameType, socketInfo.gameName));
                            await addUserToGame(gameCollection, socketInfo.gameName, socketInfo.session_id, "w");
                            const response = {
                                type: "success",
                                side: 'w'
                            }
                            broadcastGame(socketMap, socketInfo.gameName, {
                                type: "update",
                                game: await findGameByName(gameCollection, socketInfo.gameName),
                            })
                            socket.send(JSON.stringify(response));
                        } else if (game.w == socketInfo.session_id) {
                            const response = {
                                type: "success",
                                side: "w"
                            }
                            broadcastGame(socketMap, socketInfo.gameName, moveMessage)
                            socket.send(JSON.stringify(response));
                        } else if (game && game.b == null && game.x != socketInfo.session_id) {
                            await addUserToGame(gameCollection, socketInfo.gameName, socketInfo.session_id, "b");
                            const response = {
                                type: "success",
                                side: "b"
                            }
                            broadcastGame(socketMap, socketInfo.gameName, moveMessage)
                            socket.send(JSON.stringify(response));
                        } else if (game.b == socketInfo.session_id) {
                            const response = {
                                type: "success",
                                side: "b"
                            }
                            broadcastGame(socketMap, socketInfo.gameName, moveMessage)
                            socket.send(JSON.stringify(response));
                        } else if (game.b != null && game.x != null) {
                            const response = {
                                type: "error",
                                error: "GAME_FULL"
                            }
                            socket.send(JSON.stringify(response));
                            console.log("gf");
                        } else {

                        }





                    }
                } else if (jsonmessage.gameType == 'connectfour') {//connect four
                    console.log('ct');
                    if (jsonmessage.type == 'makeMove') {
                        console.log('trying to make move');
                        console.log("socketmap size: " + socketMap.size)
                        const gameData = await findGameByName(gameCollection, jsonmessage.gameName);
                        console.log('making move?');
                        await connectfourMakeMove(gameCollection, jsonmessage.message, gameData);

                
                        
                            const moveMessage = {
                                type: "update",
                                game: await findGameByName(gameCollection, jsonmessage.gameName)
                            }
                            broadcastGame(socketMap, socketInfo.gameName, moveMessage)
                        





                    }
                    if (jsonmessage.type == 'winner') {
                        broadcastGame(socketMap, socketInfo.gameName, jsonmessage);
                    }
                    if (jsonmessage.type == 'connectGame') {
                        console.log('checkCG');
                        const game = await findGameByName(gameCollection, jsonmessage.gameName)
                        console.log(game);
                        const moveMessage = {
                            type: "update",
                            game: game
                        }
                        socketInfo.gameName = jsonmessage.gameName;
                        socketInfo.gameType = jsonmessage.gameType;
                        socketInfo.session_id = jsonmessage.session_id;
                        socketMap.set(socket, socketInfo);
                        if (game == null) {
                            await createGame(gameCollection, generateGame(socketInfo.gameType, socketInfo.gameName));
                            await addUserToGame(gameCollection, socketInfo.gameName, socketInfo.session_id, "w");
                            const response = {
                                type: "success",
                                side: 1
                            }
                            broadcastGame(socketMap, socketInfo.gameName, {
                                type: "update",
                                game: await findGameByName(gameCollection, socketInfo.gameName),
                            })
                            socket.send(JSON.stringify(response));
                        } else if (game.w == socketInfo.session_id) {
                            const response = {
                                type: "success",
                                side: 1
                            }
                            broadcastGame(socketMap, socketInfo.gameName, moveMessage)
                            socket.send(JSON.stringify(response));
                        } else if (game && game.b == null && game.x != socketInfo.session_id) {
                            await addUserToGame(gameCollection, socketInfo.gameName, socketInfo.session_id, "b");
                            const response = {
                                type: "success",
                                side: -1
                            }
                            broadcastGame(socketMap, socketInfo.gameName, moveMessage)
                            socket.send(JSON.stringify(response));
                        } else if (game.b == socketInfo.session_id) {
                            const response = {
                                type: "success",
                                side: -1
                            }
                            broadcastGame(socketMap, socketInfo.gameName, moveMessage)
                            socket.send(JSON.stringify(response));
                        } else if (game.b != null && game.x != null) {
                            const response = {
                                type: "error",
                                error: "GAME_FULL"
                            }
                            socket.send(JSON.stringify(response));
                            console.log("gf");
                        } else {

                        }





                    }
                } else {
                    console.log("?")
                }
                
                
            } catch (e) {
                jsonmessage = {}
                console.log(e);
            }
            
            
        });
    })
    
    // returns game object of game with name gamename
    app.get("/api/getgamedata/:gamename", async (request, response) => {
        console.log("retrieved " + request.params.gamename)
        game = await findGameByName(gameCollection, request.params.gamename);
        if (!game) {
            game = {};
        }
        response.json(game);
    });

    //Returns empty object if no gamename parameter is given
    app.get("/api/getgamedata/", async (request, response) => {
        response.json({});
    });

    //Expects request with body in form of {"username":"username", "password":"password"}, returns session token if successful auth
    app.post('/login', async (req, res) => { 
        const username = req.body.username;
        const password = req.body.password;

        if (await authUser(userCollection, username, password) == 'USER_AUTHED') {
            const token = generateToken(username, secretKey);
            console.log(token);
            await updateUserSessionID(userCollection, username, token);
            res.json({ token });
        } else {
            res.status(401);
            res.json({});
        }
        

    })
    app.post('/getuserdata', async (req, res) => {
        const token = req.body.token;
        const data = await getUserData(userCollection, token)
        if (data) {
            res.json({ data });
        } else {
            res.status(401);
            res.json({"error": "stale session_id"});
        }


    })

    app.post('/register', async (req, res) => {//Attempts to create a new user, returns result:'USER_ADDED' or result:'USER_ALREADY_EXISTS'
        const username = req.body.username;
        const password = req.body.password;

        const result = await addUser(userCollection, username, password);

        if (result == 'USER_ADDED') {
            console.log(username + " added to database");
            res.json({ result });
        } else {
            res.status(200);
            res.json({result});
        }


    })




    

}


async function connectfourMakeMove(gameCollection, game, gameData) {
    next = gameData.nextToMove;
    if (game != gameData.currentBoard) {
        if (gameData.nextToMove == 1) {
            next = -1;
        } else {
            next = 1;
        }
    } else {

    }
    console.log(game);

    await gameCollection.updateOne({ _id: gameData._id }, {
        "$set": {
            currentBoard: game,
            nextToMove: next
        }
    })

}

function broadcastGame(socketMap, gameName, message) {
    socketMap.forEach((data, socket, m) => {
        if (data.gameName == gameName) {
            console.log(message);
            socket.send(JSON.stringify(message));
        }
    });
}

async function checkersMakeMove(gameCollection, game, gameData) {
    next = gameData.nextToMove;
    if (game != gameData.currentBoard) {
        if (gameData.nextToMove == 'w') {
            next = 'b';
        } else {
            next = 'w';
        }
    } else {

    }
    console.log(game);

    for (i = 1; i < 8; i += 2) {
        if (game[i] == 'b') {
            game[i] = 'bk'
        }
    }
    for (i = 56; i < 63; i += 2) {
        if (game[i] == 'w') {
            game[i] = 'wk'
        }
    }
    await gameCollection.updateOne({ _id: gameData._id }, {
        "$set": {
            currentBoard: game,
            nextToMove: next
        }
    })
}



async function checkerCheckForWin(gameCollection, game) {
    var w = true;
    var b = true;
    game.forEach((element) => {
        if (element == 'w' || element == 'wk') {
            w = false;
        }
        if (element == 'b' || element == 'bk') {
            b = false;
        }
    })

    if (w) {
        return 'w'
    } else if (b) {
        return 'b'
    } else {
        return 'e';
    }
}

async function tictactoeMakeMove(gameCollection, game, space, side) {
    if (tictactoeCheckForWin(game).winner == 'e') {
        next = '';
        if (game.nextToMove == 'x') {
            next = 'o';
        } else {
            next = 'x';
        }
        if (game.currentBoard[space] == 'e' && game.nextToMove == side) {
            game.currentBoard[space] = side;
            await gameCollection.updateOne({ _id: game._id }, {
                "$set": {
                    currentBoard: game.currentBoard,
                    nextToMove: next
                }
            })
        }
    }
    

}

function tictactoeCheckForWin(game) {
    winner = {
        winner: 'e',
        type: '',
        position: 0
    }

    //Check rows for winner
    for (let j = 0; j <= 6; j = j + 3) {
        last = game.currentBoard[j];
        if (winner.winner != 'e') {
            winner.position = j / 3;
            winner.type = 'row';
            return winner;
        }
        for (let i = 1; i <= 2; i++) {
            if (game.currentBoard[i + j] == last && game.currentBoard[j] == game.currentBoard[i + j] ) {
                last = game.currentBoard[j+i];
                winner.winner = last;
            } else {
                last = game.currentBoard[j + i];
                winner.winner = 'e';
            }
        }
    }
    
    //check cols for winner
    for (let j = 0; j <= 2; j ++) {
        last = game.currentBoard[j];
        if (winner.winner != 'e') {
            winner.position = j;
            winner.type = 'col';
            return winner;
        }
        for (let i = 3; i <= 6; i = i+3) {
            if (game.currentBoard[i + j] == last && game.currentBoard[j] == game.currentBoard[i + j]) {
                last = game.currentBoard[j + i];
                winner.winner = last;
            } else {
                last = game.currentBoard[j + i];
                winner.winner = 'e';
            }
        }
    }

    //check diagonal for winner
    if (game.currentBoard[0] == game.currentBoard[4] && game.currentBoard[4] == game.currentBoard[8] && game.currentBoard[0] != 'e') {
        winner.winner = game.currentBoard[0]
        winner.position = 1;
        winner.type = 'diag';
        return winner;
    }

    if (game.currentBoard[2] == game.currentBoard[4] && game.currentBoard[4] == game.currentBoard[6] && game.currentBoard[0] != 'e') {
        winner.winner = game.currentBoard[2]
        winner.position = 2;
        winner.type = 'diag';
        return winner;
    }
    
    
    return winner;
}

//Returns a game object with name gameName and type gameType
function generateGame(gameType, gameName) {
    if (gameType == 'tictactoe') {
        return {
            _id: gameName,
            gameType: "tictactoe",
            currentBoard: ["e", "e", "e", "e", "e", "e", "e", "e", "e"],
            nextToMove: "x",
            x: null,
            o: null
        }
    } else if (gameType == "checkers") {
        return {
            _id: gameName,
            gameType: "checkers",
            currentBoard: [
                "e", "w", "e", "w", "e", "w", "e", "w",
                "w", "e", "w", "e", "w", "e", "w", "e",
                "e", "w", "e", "w", "e", "w", "e", "w",
                "e", "e", "e", "e", "e", "e", "e", "e",
                "e", "e", "e", "e", "e", "e", "e", "e",
                "b", "e", "b", "e", "b", "e", "b", "e",
                "e", "b", "e", "b", "e", "b", "e", "b",
                "b", "e", "b", "e", "b", "e", "b", "e"],
            nextToMove: "w",
            w: null,
            b: null
            }
    } else if (gameType == "connectfour") {
        return {
            _id: gameName,
            gameType: "connectfour",
            currentBoard: [
                0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0],
            nextToMove: 1,
            w: null,
            b: null
        }
    }else {
            console.error("tried to create a game of invalid gameType");
        }
}


async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));

}

//Adds a game object to the database
async function createGame(gameCollection, game) {
    if (await gameCollection.findOne({ _id: game._id })) {
        console.log("Tried to create a game with a name that already exists: " + game._id );
    }else {
        const result = await gameCollection.insertOne(game);
        console.log(`New listing created with the following id: ${result.insertedId}`);
    }
}

async function findGameByName(gameCollection, gameName) {
    return await gameCollection.findOne({ "_id": gameName });
}

async function getUserData(userCollection, userToken) {
    return await userCollection.findOne({ session_id: userToken }, { projection: { password: 0, session_id: 0 } });
}

//Creates account. If success returns USER_ADDED if failure returns USER_ALREADY_EXISTS
async function addUser(userCollection, username, password) {
    if (await userCollection.findOne({ _id: username })) {
        return 'USER_ALREADY_EXISTS';
    } else {
        await userCollection.insertOne({ _id: username, password: password, session_id: '', wins: 0, played: 0});
        return 'USER_ADDED';
    }
}

async function addUserToGame(gameCollection, gameName, userSessionId, side) {
    const game = await findGameByName(gameCollection, gameName);
    if (game.gameType == "tictactoe" && side == "x" && game.x == null) {
        console.log(game);
        await gameCollection.updateOne(
            { _id: gameName },
            {
                "$set": {
                    x: userSessionId
                }
            }
        );
    } else if (game.gameType == "tictactoe" && side == "o" && game.o == null) {
        await gameCollection.updateOne(
            { _id: gameName },
            {
                "$set": {
                    o: userSessionId
                }
            }
        );
    }

    if (game.gameType == "checkers" && side == "w" && game.w == null) {
        await gameCollection.updateOne(
            { _id: gameName },
            {
                "$set": {
                    w: userSessionId
                }
            }
        );
    } else if (game.gameType == "checkers" && side == "b" && game.b == null) {
        await gameCollection.updateOne(
            { _id: gameName },
            {
                "$set": {
                    b: userSessionId
                }
            }
        );
    }

    if (game.gameType == "connectfour" && side == "w" && game.w == null) {
        await gameCollection.updateOne(
            { _id: gameName },
            {
                "$set": {
                    w: userSessionId
                }
            }
        );
    } else if (game.gameType == "connectfour" && side == "b" && game.b == null) {
        await gameCollection.updateOne(
            { _id: gameName },
            {
                "$set": {
                    b: userSessionId
                }
            }
        );
    }


}

//returns 'USER_AUTHED' if username:password combo is good, 'INVALID_PASSWORD' if user exists but password is wrong, and 'USER_DOES_NOT_EXIST' if user does not exist
async function authUser(userCollection, username, password) {
    const result = await userCollection.findOne({ _id: username });
    if (result) {
        if (result.password == password) {
            return 'USER_AUTHED';
        } else {
            return 'INVALID_PASSWORD';
        }
    } else {
        return 'USER_DOES_NOT_EXIST';
    }
}

//Updates session_id for user with username
async function updateUserSessionID(userCollection, username, token) {
    await userCollection.updateOne(
        { _id: username },
        {
            "$set": {
                session_id: token
            }
        }
    );
}

function generateToken(user, secretKey){
    const payload = {
        id: user
    };

    const token = jwt.sign(payload, secretKey, {
        expiresIn: '1h', // The token expires after 1 hour
    });

    return token;
};


main().catch(console.error);

