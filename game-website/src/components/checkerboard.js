import { Select } from "@mui/material";
import React, { useEffect, useState, useRef } from "react"
import useWebSocket from 'react-use-websocket';
import { useAuth } from '../context/user.context';
import Result from '../components/resultPopup'
import ss from '../CSS/checkers.module.css'

const Checkerboard = () => {
    const canvasRef = useRef(null);
    const { token } = useAuth();
    const { sendJsonMessage, lastJsonMessage } = useWebSocket('wss://games.zenithgaming.horse/ws', {
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 1,
        reconnectAttempts: 5,
    });
    const [side, setSide] = useState('');
    const [turn, setTurn] = useState('');
    const [winner, setWinner] = useState('');
    const [condition, setCondition] = useState('');
    const [selectedBoxes, setSelectedBoxes] = useState([]);
    const [gameName, setGameName] = useState('');
    const [gameData, setGameData] = useState([
        "e", "w", "e", "w", "e", "w", "e", "w",
        "w", "e", "w", "e", "w", "e", "w", "e",
        "e", "w", "e", "w", "e", "w", "e", "w",
        "e", "e", "e", "e", "e", "e", "e", "e",
        "e", "w", "e", "e", "e", "e", "e", "e",
        "b", "e", "b", "e", "b", "e", "b", "e",
        "e", "b", "e", "b", "e", "b", "e", "b",
        "b", "e", "b", "e", "b", "e", "b", "e"]);
    const [possibleMoves, setPossibleMoves] = useState([]);

    useEffect(() => {
        drawBoard();
    }, []); // Empty dependency array to run the effect only once

    useEffect(() => {
        if (gameData != null) {
            drawBoard();
        }
    }, [gameData, selectedBoxes, possibleMoves]);

    useEffect(() => {
        possibleCapture();
    }, [selectedBoxes, gameData])


    const handleSubmit = (e) => {
        e.preventDefault();
        const message = {
            type: 'connectGame',
            gameName: gameName,
            session_id: token,
            gameType: "checkers"
        }

        sendJsonMessage(message);//Sends a json message to the node server to request data for gameName


    }

    useEffect(() => {
        console.log(JSON.stringify(lastJsonMessage));
        if (lastJsonMessage !== null) {//Whenever a json message is received, refresh gameData 
            if (lastJsonMessage.type === "success") {
                setSide(lastJsonMessage.side);
            } else if (lastJsonMessage.error) {
                if (lastJsonMessage.error === "GAME_FULL") {
                    setCondition('full')
                }
            } else if (lastJsonMessage.type === "update") {
                setGameData(lastJsonMessage.game.currentBoard);
                setTurn(lastJsonMessage.game.nextToMove);
            } else if (lastJsonMessage.type === "winner") {
                setWinner(lastJsonMessage.winner);
                setCondition('win')
                console.log("winner is " + lastJsonMessage.winner);
            }
        } else {
            setGameData([
                "e", "w", "e", "w", "e", "w", "e", "w",
                "w", "e", "e", "e", "w", "e", "w", "e",
                "e", "w", "e", "w", "e", "w", "e", "w",
                "e", "e", "b", "e", "e", "e", "e", "e",
                "e", "e", "e", "e", "e", "w", "e", "e",
                "b", "e", "b", "e", "b", "e", "b", "e",
                "e", "b", "e", "b", "e", "b", "e", "b",
                "b", "e", "b", "e", "b", "e", "b", "e"]);
        }
    }, [lastJsonMessage]);

    const handleMove = (cell) => {

        const message = {
            type: 'makeMove',
            message: gameData,
            gameName: gameName,
            gameType: "checkers",
        }

        var sidek = side + "k";
        var turnk = turn + "k";
        const scell = gameData[selectedBoxes];
        console.log(scell);


        console.log("side: " + side + ":" + gameData[selectedBoxes] + ":" + turn);
        if (side === turn && ((gameData[selectedBoxes] == side) || (gameData[selectedBoxes] == sidek))) {
            console.log((gameData[selectedBoxes] == side || gameData[selectedBoxes] == sidek) && (gameData[selectedBoxes] == turn || gameData[selectedBoxes] == turnk))
            if ((gameData[selectedBoxes] == 'w' || gameData[selectedBoxes] == 'wk' ) && (gameData[selectedBoxes] == side || gameData[selectedBoxes] == sidek) && (gameData[selectedBoxes] == turn || gameData[selectedBoxes] == turnk) ) {
                if (((cell - selectedBoxes) % 9) == 0 && cell - selectedBoxes > 0) {
                    console.log('rdm')
                    gameData[cell] = scell
                    gameData[selectedBoxes] = 'e';
                    if (((cell - selectedBoxes) / 9) > 1) {
                        gameData[cell - 9] = 'e'
                        console.log("rdjm");
                        gameData[cell] = scell
                        gameData[selectedBoxes] = 'e';
                    }
                } else if (((cell - selectedBoxes) % 7) == 0 && cell - selectedBoxes > 0) {
                    console.log("ldm")
                    gameData[cell] = gameData[selectedBoxes]
                    gameData[selectedBoxes] = 'e';
                    if (((cell - selectedBoxes) / 7) > 1) {
                        gameData[cell - 7] = 'e'
                        console.log("ldjm");
                        gameData[cell] = scell
                        gameData[selectedBoxes] = 'e';
                    }
                }else


                if (((selectedBoxes - cell) % 9) == 0) {
                    console.log('lum')
                    gameData[cell] = scell
                    gameData[selectedBoxes] = 'e';
                    if (((selectedBoxes - cell) / 9) > 1) {
                        gameData[selectedBoxes - 9] = 'e'
                        console.log("lujm");
                        gameData[cell] = scell
                        gameData[selectedBoxes] = 'e';
                    }
                } else if (((selectedBoxes - cell) % 7) == 0) {
                    console.log("rum")
                    gameData[cell] = scell
                    gameData[selectedBoxes] = 'e';
                    if (((selectedBoxes - cell) / 7) > 1) {
                        gameData[selectedBoxes - 7] = 'e'
                        console.log("rujm");
                        gameData[cell] = scell
                        gameData[selectedBoxes] = 'e';
                    }

                }


            } else if ((gameData[selectedBoxes] == 'b' || gameData[selectedBoxes] == 'bk') && (gameData[selectedBoxes] == side || gameData[selectedBoxes] == sidek) && (gameData[selectedBoxes] == turn || gameData[selectedBoxes] == turnk)) {
                if (((selectedBoxes - cell) % 9) == 0 && selectedBoxes - cell > 0) {
                    console.log('lum')
                    gameData[cell] = scell
                    gameData[selectedBoxes] = 'e';
                    if (((selectedBoxes - cell) / 9) > 1) {
                        gameData[selectedBoxes - 9] = 'e'
                        console.log("lujm");
                        gameData[cell] = scell
                        gameData[selectedBoxes] = 'e';
                    }
                } else if (((selectedBoxes - cell) % 7) == 0 && selectedBoxes - cell > 0) {
                    console.log("rum")
                    gameData[cell] = scell
                    gameData[selectedBoxes] = 'e';
                    if (((selectedBoxes - cell) / 7) > 1) {
                        gameData[selectedBoxes - 7] = 'e'
                        console.log("rujm");
                        gameData[cell] = scell
                        gameData[selectedBoxes] = 'e';
                    }
                } else if (((cell - selectedBoxes) % 9) == 0) {
                    console.log('rdm')
                    gameData[cell] = scell
                    gameData[selectedBoxes] = 'e';
                    if (((cell - selectedBoxes) / 9) > 1) {
                        gameData[cell - 9] = 'e'
                        console.log("rdjm");
                        gameData[cell] = scell
                        gameData[selectedBoxes] = 'e';
                    }
                } else if (((cell - selectedBoxes) % 7) == 0) {
                    console.log("ldm")
                    gameData[cell] = gameData[selectedBoxes]
                    gameData[selectedBoxes] = 'e';
                    if (((cell - selectedBoxes) / 7) > 1) {
                        gameData[cell - 7] = 'e'
                        console.log("ldjm");
                        gameData[cell] = scell
                        gameData[selectedBoxes] = 'e';
                    }
                }

            }

            message.message = gameData;
            console.log(message.gameData);
            sendJsonMessage(message);
        }

    
        

    }

    const drawBoard = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const squareSize = 62.5;
        const boardSize = 8;

        // Draws the checkerboard
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const x = col * squareSize;
                const y = row * squareSize;

                // Alternates the color of the squares
                const color = (row + col) % 2 === 0 ? '#FAF5DC' : '#966A5B';

                context.fillStyle = color;
                context.fillRect(x, y, squareSize, squareSize);
            }
        }

        if (selectedBoxes != null) {
            context.lineWidth = 5;
            const rectx = ((selectedBoxes) % boardSize) * squareSize;
            const recty = Math.trunc((selectedBoxes / boardSize)) * squareSize;
            context.strokeRect(rectx, recty, squareSize, squareSize)
            possibleMoves.forEach((element) => {
                console.log("drawing:" + element)
                const rectx = ((element) % boardSize) * squareSize;
                const recty = Math.trunc((element / boardSize)) * squareSize;
                context.strokeRect(rectx, recty, squareSize, squareSize)
            })
            
            context.lineWidth = 1;
        }

        const pieceRadius = squareSize / 2.2 - 5;

        for (let cell = 0; cell < 64; cell++) {
            const col = cell % 8;
            const row = Math.trunc(cell / boardSize);
            if (gameData[cell] === 'w') {
                const x = col * squareSize + squareSize / 2;
                const y = row * squareSize + squareSize / 2;

                // Draw the white piece
                context.fillStyle = '#FAF5DC';
                context.beginPath();
                context.arc(x, y, pieceRadius, 0, 2 * Math.PI);
                context.fill();
            } else if (gameData[cell] === 'b') {
                const x = col * squareSize + squareSize / 2;
                const y = row * squareSize + squareSize / 2;

                // Draw the black piece
                context.fillStyle = '#5D5360';
                context.beginPath();
                context.arc(x, y, pieceRadius, 0, 2 * Math.PI);
                context.fill();
            } else if (gameData[cell] === 'wk') {
                const x = col * squareSize + squareSize / 2;
                const y = row * squareSize + squareSize / 2;

                // Draw the white king piece
                context.fillStyle = '#FAF5DC';
                context.beginPath();
                context.arc(x, y, pieceRadius, 0, 2 * Math.PI);
                context.fill();

                context.beginPath();
                context.strokeStyle = '#FEA734';
                context.lineWidth = 10;
                context.arc(x, y, pieceRadius-5, 0, 2 * Math.PI);
                context.stroke()
                context.strokeStyle = '#000000';
            } else if (gameData[cell] === 'bk') {
                const x = col * squareSize + squareSize / 2;
                const y = row * squareSize + squareSize / 2;

                // Draw the black king piece
                context.fillStyle = '#5D5360';
                context.beginPath();
                context.arc(x, y, pieceRadius, 0, 2 * Math.PI);
                context.fill();
                context.beginPath();

                context.beginPath();
                context.strokeStyle = '#FEA734';
                context.lineWidth = 10;
                context.arc(x, y, pieceRadius - 5, 0, 2 * Math.PI);
                context.stroke()
                context.strokeStyle = '#000000';
            }

        }

    };

    function possibleCapture() {
        console.log("seeking possible capture");
        var possibleSquares = [];

        //define function to find first possible moves for clicked piece
        function loadPossibleSquares(color, square) {
            //if color is red
            if (color == 'w') {
                //if square of clicked piece is not leftmost, rightmost, or on bottom row
                if ((square % 8 > 0) && (square % 8 < 7) && (square <= 55)) {
                    if (!possibleSquares.includes(square + 7)) { possibleSquares.push(square + 7) };
                    if (!possibleSquares.includes(square + 9)) { possibleSquares.push(square + 9) };
                }
                //if square is leftmost
                else if ((square % 8 == 0) && (square <= 55)) {
                    if (!possibleSquares.includes(square + 9)) { possibleSquares.push(square + 9) };
                }
                //if square is rightmost
                else if ((square % 8 == 7) && (square <= 55)) {
                    if (!possibleSquares.includes(square + 7)) { possibleSquares.push(square + 7) };
                }
            }
            //basically do the same things in reverse for black pieces
            else if (color == 'b') {
                if ((square % 8 > 0) && (square % 8 < 7) && (square >= 8)) {
                    if (!possibleSquares.includes(square - 7)) { possibleSquares.push(square - 7) };
                    if (!possibleSquares.includes(square - 9)) { possibleSquares.push(square - 9) };
                }
                else if ((square % 8 == 0) && (square >= 8)) {
                    if (!possibleSquares.includes(square - 7)) { possibleSquares.push(square - 7) };
                }
                else if ((square % 8 == 7) && (square >= 8)) {
                    if (!possibleSquares.includes(square - 9)) { possibleSquares.push(square - 9) };
                }
            } else if (color == 'bk' || color == 'wk') {

                if ((square % 8 > 0) && (square % 8 < 7) && (square <= 55)) {
                    if (!possibleSquares.includes(square + 7)) { possibleSquares.push(square + 7) };
                    if (!possibleSquares.includes(square + 9)) { possibleSquares.push(square + 9) };
                } else if ((square % 8 == 0) && (square <= 55)) {
                    if (!possibleSquares.includes(square + 9)) { possibleSquares.push(square + 9) };
                }
                //if square is rightmost
                else if ((square % 8 == 7) && (square <= 55)) {
                    if (!possibleSquares.includes(square + 7)) { possibleSquares.push(square + 7) };
                }

                if ((square % 8 > 0) && (square % 8 < 7) && (square >= 8)) {
                    if (!possibleSquares.includes(square - 7)) { possibleSquares.push(square - 7) };
                    if (!possibleSquares.includes(square - 9)) { possibleSquares.push(square - 9) };
                }
                else if ((square % 8 == 0) && (square >= 8)) {
                    if (!possibleSquares.includes(square - 7)) { possibleSquares.push(square - 7) };
                }
                else if ((square % 8 == 7) && (square >= 8)) {
                    if (!possibleSquares.includes(square - 9)) { possibleSquares.push(square - 9) };
                }
                

            }
        }

        //get initial possible moves for clicked piece
        loadPossibleSquares(gameData[selectedBoxes], selectedBoxes);
        console.log(possibleSquares);

        //next state that if possible square is occupied with enemy piece, check that next diagonal piece, beyond enemy, is empty and add to possible squares
        for (let i = 0; i < possibleSquares.length; i++) {
            //if clicked piece is red
            if (gameData[selectedBoxes] == 'w') {
                //if the square being tested is not empty or the same color as the clicked piece
                console.log(gameData[possibleSquares[i]] + " : " + gameData[possibleSquares[i]] + ":" + gameData[selectedBoxes])
                if ((gameData[possibleSquares[i]] != 'e') && (gameData[possibleSquares[i]] != gameData[selectedBoxes])) {

                    //if square being tested is in column to the right of clicked piece but not rightmost on board
                    console.log(possibleSquares[i] % 8 + ":" + selectedBoxes % 8 + ":" + possibleSquares[i] % 8);
                    if ((possibleSquares[i] % 8 > selectedBoxes % 8) && (possibleSquares[i] % 8 < 7)) {
                        console.log('h');

                        //if next square over and down is still on board and is empty
                        if (((possibleSquares[i] + 9) <= 63) && (gameData[possibleSquares[i] + 9] == 'e')) {
                            possibleSquares.push(possibleSquares[i] + 9);
                        }
                    }
                    //if square being tested is in column to the left of clicked piece but not leftmost on board
                    else if ((possibleSquares[i] % 8 < selectedBoxes % 8) && (possibleSquares[i] % 8 > 0)) {
                        console.log('rrrr');
                        //if next square over and down is still on board and is empty
                        if (((possibleSquares[i] + 7) <= 63) && (gameData[possibleSquares[i] + 7] == 'e')) {
                            possibleSquares.push(possibleSquares[i] + 7);
                        }
                    }
                }
            }
            //if clicked piece is black, do everything mirrored
            else if (gameData[selectedBoxes] == 'b') {
                if ((gameData[possibleSquares[i]] != 'e') && (gameData[possibleSquares[i]] != gameData[selectedBoxes])) {
                    console.log(possibleSquares[i] % 8 + ":" + selectedBoxes % 8 + ":" + possibleSquares[i] % 8);
                    if ((possibleSquares[i] % 8 > selectedBoxes % 8) && (possibleSquares[i] % 8 < 7)) {
                        if (((possibleSquares[i] - 7) >= 0) && (gameData[possibleSquares[i] - 7] == 'e')) {
                            possibleSquares.push(possibleSquares[i] - 7);
                        }
                    }
                    else if ((possibleSquares[i] % 8 < selectedBoxes % 8) && (possibleSquares[i] % 8 > 0)) {
                        if (((possibleSquares[i] - 9) >= 0) && (gameData[possibleSquares[i] - 9] == 'e')) {
                            possibleSquares.push(possibleSquares[i] - 9);
                        }
                    }
                }
            } else if(gameData[selectedBoxes] == 'wk'){//Checks forwards and backwards for white kings


                //if the square being tested is not empty or the same color as the clicked piece
                console.log(gameData[possibleSquares[i]] + " : " + gameData[possibleSquares[i]] + ":" + 'w')
                if ((gameData[possibleSquares[i]] != 'e') && (gameData[possibleSquares[i]] != 'w')) {

                    //if square being tested is in column to the right of clicked piece but not rightmost on board
                    console.log(possibleSquares[i] % 8 + ":" + selectedBoxes % 8 + ":" + possibleSquares[i] % 8);
                    if ((possibleSquares[i] % 8 > selectedBoxes % 8) && (possibleSquares[i] % 8 < 7)) {
                        console.log('h');

                        //if next square over and down is still on board and is empty
                        if (((possibleSquares[i] + 9) <= 63) && (gameData[possibleSquares[i] + 9] == 'e')) {
                            possibleSquares.push(possibleSquares[i] + 9);
                        }
                    }
                    //if square being tested is in column to the left of clicked piece but not leftmost on board
                    else if ((possibleSquares[i] % 8 < selectedBoxes % 8) && (possibleSquares[i] % 8 > 0)) {
                        console.log('rrrr');
                        //if next square over and down is still on board and is empty
                        if (((possibleSquares[i] + 7) <= 63) && (gameData[possibleSquares[i] + 7] == 'e')) {
                            possibleSquares.push(possibleSquares[i] + 7);
                        }
                    }
                }


                if ((gameData[possibleSquares[i]] != 'e') && (gameData[possibleSquares[i]] != 'w')) {
                    console.log(possibleSquares[i] % 8 + ":" + selectedBoxes % 8 + ":" + possibleSquares[i] % 8);
                    if ((possibleSquares[i] % 8 > selectedBoxes % 8) && (possibleSquares[i] % 8 < 7)) {
                        if (((possibleSquares[i] - 7) >= 0) && (gameData[possibleSquares[i] - 7] == 'e')) {
                            possibleSquares.push(possibleSquares[i] - 7);
                        }
                    }
                    else if ((possibleSquares[i] % 8 < selectedBoxes % 8) && (possibleSquares[i] % 8 > 0)) {
                        if (((possibleSquares[i] - 9) >= 0) && (gameData[possibleSquares[i] - 9] == 'e')) {
                            possibleSquares.push(possibleSquares[i] - 9);
                        }
                    }
                }




            } else if (gameData[selectedBoxes] == 'bk') {//Checks forwards and backwards for white kings


                //if the square being tested is not empty or the same color as the clicked piece
                console.log(gameData[possibleSquares[i]] + " : " + gameData[possibleSquares[i]] + ":" + 'b')
                if ((gameData[possibleSquares[i]] != 'e') && (gameData[possibleSquares[i]] != 'b')) {

                    //if square being tested is in column to the right of clicked piece but not rightmost on board
                    console.log(possibleSquares[i] % 8 + ":" + selectedBoxes % 8 + ":" + possibleSquares[i] % 8);
                    if ((possibleSquares[i] % 8 > selectedBoxes % 8) && (possibleSquares[i] % 8 < 7)) {
                        console.log('h');

                        //if next square over and down is still on board and is empty
                        if (((possibleSquares[i] + 9) <= 63) && (gameData[possibleSquares[i] + 9] == 'e')) {
                            possibleSquares.push(possibleSquares[i] + 9);
                        }
                    }
                    //if square being tested is in column to the left of clicked piece but not leftmost on board
                    else if ((possibleSquares[i] % 8 < selectedBoxes % 8) && (possibleSquares[i] % 8 > 0)) {
                        console.log('rrrr');
                        //if next square over and down is still on board and is empty
                        if (((possibleSquares[i] + 7) <= 63) && (gameData[possibleSquares[i] + 7] == 'e')) {
                            possibleSquares.push(possibleSquares[i] + 7);
                        }
                    }
                }


                if ((gameData[possibleSquares[i]] != 'e') && (gameData[possibleSquares[i]] != 'b')) {
                    console.log(possibleSquares[i] % 8 + ":" + selectedBoxes % 8 + ":" + possibleSquares[i] % 8);
                    if ((possibleSquares[i] % 8 > selectedBoxes % 8) && (possibleSquares[i] % 8 < 7)) {
                        if (((possibleSquares[i] - 7) >= 0) && (gameData[possibleSquares[i] - 7] == 'e')) {
                            possibleSquares.push(possibleSquares[i] - 7);
                        }
                    }
                    else if ((possibleSquares[i] % 8 < selectedBoxes % 8) && (possibleSquares[i] % 8 > 0)) {
                        if (((possibleSquares[i] - 9) >= 0) && (gameData[possibleSquares[i] - 9] == 'e')) {
                            possibleSquares.push(possibleSquares[i] - 9);
                        }
                    }
                }




            }

        }

        //remove all possibilities that are already occupied or are not capture spots
        console.log("possible squares before trimming: " + possibleSquares);
        var tempArr = [];
        possibleSquares.forEach(function (value) {
            tempArr.push(value);
        });
        possibleSquares.forEach(function (value) {
            console.log("evaluating " + value);
            if (gameData[value] != 'e' || (Math.floor(gameData[value] / 8) - Math.floor(selectedBoxes / 8) == 1) || (Math.floor(gameData[value] / 8) - Math.floor(selectedBoxes / 8) == -1)) {
                console.log("removing from possible squares: " + value);
                tempArr.splice(tempArr.indexOf(value), 1);
            }
        });
        possibleSquares = tempArr;

        console.log("possible capture squares: " + possibleSquares);
        setPossibleMoves(possibleSquares);
    }




    const handleClick = (event) => {//Prints the current location of the mouse relative to the canvas when the canvas is clicked
        const canvas = canvasRef.current;
        const canvasRect = canvas.getBoundingClientRect();
        const x = Math.trunc(event.clientX - canvasRect.left);
        const y = Math.trunc(event.clientY - canvasRect.top);

        const cell = Math.trunc(x / 62.5) + (Math.trunc(y / 62.5) * 8);

        if (possibleMoves.includes(cell)) {
            handleMove(cell);
            console.log("making move: " + selectedBoxes + " to " + cell);
        }
        setSelectedBoxes(cell);
        console.log(cell);
    };

    const handleBoxClick = () => {
        setCondition(false);
    };

    return (
        <div id={ss.checkersContainer}>
            <Result condition={condition} winner={winner} onBoxClick={handleBoxClick}/>
            <div class={ss.formContainer}>
                <form onSubmit={handleSubmit}>
                    <div class={ss.labelButton}>
                        <label for="text">Game name</label>
                        <button type="submit" id="button">Get game data</button>
                    </div>
                    <input value={gameName} onChange={(e) => setGameName(e.target.value)} type="text" id="gamename" name="gamename"></input>
                </form>
            </div>

            <canvas ref={canvasRef} onClick={handleClick} width={500} height={500} style={{ borderRadius: '8px' }} />
        </div>
    );
};

export default Checkerboard;
