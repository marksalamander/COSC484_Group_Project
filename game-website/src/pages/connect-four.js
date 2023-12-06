import React, { useEffect, useState, useRef } from "react"
import Header from "../components/header"
import useWebSocket from 'react-use-websocket';
import AuthUser from '../components/authUser'
import s from "../CSS/connectfour.module.css"
import { useAuth } from '../context/user.context';
import { Select } from "@mui/material";
import Result from '../components/resultPopup'

export default function ConnectFour() {
    const { token } = useAuth();
    var [gameName, setGameName] = useState('');
    const { sendJsonMessage, lastJsonMessage } = useWebSocket('wss://games.zenithgaming.horse/ws', {
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 5,
        reconnectAttempts: 5,
    });
    const [gameData, setGameData] = useState([
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0]); // The current board for the game
    const [selectedColumn, setSelectedColumn] = useState([]); // Changed from selectedBoxes
    const [color, setColor] = useState(0);
    const [turn, setTurn] = useState(1);
    const [winner, setWinner] = useState(0);
    const [win, setWin] = useState('');
    const [condition, setCondition] = useState('');

    const canvasRef = useRef(null);

    useEffect(() => {
        console.log(JSON.stringify(lastJsonMessage));
        if (lastJsonMessage !== null) {
            if (lastJsonMessage.type === "success") {
                setColor(lastJsonMessage.side);
            } else if (lastJsonMessage.error) {
                if (lastJsonMessage.error === "GAME_FULL") {
                    setCondition('full')
                }
            } else if (lastJsonMessage.type === "update") {
                setGameData(lastJsonMessage.game.currentBoard);
                setTurn(lastJsonMessage.game.nextToMove);
                if(lastJsonMessage.w == token) {
                    setColor(1);
                }
                else if(lastJsonMessage.b == token) {
                    setColor(-1);
                }
                console.log("the color of this player has been set to: " + color);
            } else if (lastJsonMessage.type === "winner") {
                setWinner(lastJsonMessage.winner);
                console.log("winner is " + lastJsonMessage.winner);
            }
        } else {
            //console.log("resetting board");
            setGameData([
                0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0])
           
        }
    }, [lastJsonMessage]);

    useEffect(() => {
        if (winner != 0) {
            if(winner == 1) {
                setWin('yellow')
                setCondition('win')
            }
            else {
                setWin('red')
                setCondition('win')
            }
        }
    }, [winner]);

    useEffect(() => {
        if (gameData != null) {
            drawBoard();
        }
    }, [gameData, selectedColumn]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const message = {
            type: 'connectGame',
            gameName: gameName,
            session_id: token,
            gameType: "connectfour"
        };

        console.log("this is the JSON message sent: " + JSON.stringify(message));
        console.log("also this is the color of player: " + color);
        sendJsonMessage(message);
    };

    function findOpenSquare() {
        for(let i = 5; i >= 0; i--) {
            if(gameData[(i * 7) + selectedColumn] == 0) {
                console.log("open square found at row " + (i));
                return ((i * 7) + selectedColumn);
            }
        }
        
        //error
        return -1;
    }

    function checkWin() {
        var win = 0;

        //seek horizontal win
        for(let i = 5; i  >= 0; i--) {
            //check each column of selected row
            for(let j = 0; j < 7; j++) {
                if(win == 0) {
                    win += gameData[(i*7) + j];

                    /*if(win > 3) {
                        setWinner(1);
                        return true;
                    }
                    else if(win < -3) {
                        setWinner(-1);
                        return true;
                    }*/
                }
                //if color matches color being counted
                else if(((win > 0) && (gameData[(i*7) + j] > 0)) || ((win < 0) && (gameData[(i*7) + j] < 0))) {

                    //add to count
                    win += gameData[(i*7) + j];
                    if (win > 3) {
                        const winMsg = {
                            type: "winner",
                            winner: 1
                        }
                        sendJsonMessage(winMsg)
                        return true;
                    }
                    else if(win < -3) {
                        const winMsg = {
                            type: "winner",
                            winner: -1
                        }
                        sendJsonMessage(winMsg)
                        return true;
                    }
                }
                //if win is counting yellow and a red occurs or vice versa or empty square occurs
                else if(((win < 0) && (gameData[(i*7) + j] > 0)) || ((win > 0) && (gameData[(i*7) + j] < 0)) || gameData[(i*7) + j] == 0) {
                    //reset count
                    win = gameData[(i*7) + j];
                }
            }
        }

        win = 0;
        //seek vertical win
        for(let j = 0; j < 7; j++) {
            //check each row of selected column
            for(let i = 5; i  >= 0; i--) {
                if(win == 0) {
                    win += gameData[(i*7) + j];

                    /*if(win > 3) {
                        setWinner(1);
                        return true;
                    }
                    else if(win < -3) {
                        setWinner(-1);
                        return true;
                    }*/
                }
                //if color matches color being counted
                else if(((win > 0) && (gameData[(i*7) + j] > 0)) || ((win < 0) && (gameData[(i*7) + j] < 0))) {

                    //add to count
                    win += gameData[(i*7) + j];
                    if(win > 3) {
                        setWinner(1);
                        return true;
                    }
                    else if(win < -3) {
                        setWinner(-1);
                        return true;
                    }
                }
                //if win is counting yellow and a red occurs or vice versa or empty square occurs
                else if(((win < 0) && (gameData[(i*7) + j] > 0)) || ((win > 0) && (gameData[(i*7) + j] < 0)) || gameData[(i*7) + j] == 0) {
                    //reset count
                    win = gameData[(i*7) + j];
                }
            }
        }

        win = 0;
        //seek forward slash win
        for(let i = 5; i > 2; i--) {
            for(let j = 0; j < 4; j++) {
                win = 0;
                for(let k = 0; k < 4; k++) {
                    win += gameData[((i-k)*7) + (j + k)];
                }

                if(win == 4) {
                    setWinner(1);
                    return true;
                }
                else if(win == -4) {
                    setWinner(-1);
                    return true;
                }
            }
        }

        win = 0;
        //seek backward slash win
        for(let i = 5; i > 2; i--) {
            for(let j = 3; j < 7; j++) {
                win = 0;
                for(let k = 0; k < 4; k++) {
                    win += gameData[((i-k)*7) + (j - k)];
                }

                if(win == 4) {
                    setWinner(1);
                    return true;
                }
                else if(win == -4) {
                    setWinner(-1);
                    return true;
                }
            }
        }

        console.log("no win found");
        return false;
    }

    const handleMove = (e) => {
        console.log("**********MOVE SUBMITTED**********");
        e.preventDefault();

        console.log(turn + " : " + color);
        if (selectedColumn === null) {
            setCondition('null')
        } else if (winner === 1 || winner === -1) {
            if(winner == 1) {
                setWin('yellow')
                setCondition('win')
            }
            else {
                setWin('red')
                setCondition('win')
            }
        } else if ((turn === color) && (gameData[selectedColumn] == 0)) {
            console.log("circle will be drawn at " + findOpenSquare());
            var message = {};
            
            
            var openSquare = findOpenSquare();
            if((turn === 1)) {
                gameData[openSquare] = 1;
                message = {
                    type: 'makeMove',
                    message: gameData,
                    gameName: gameName,
                    gameType: "connectfour"
                };
                console.log("this is the JSON message sent: " + JSON.stringify(message));
                sendJsonMessage(message);
                //drawYellowCircle(context, (selectedColumn * 100) + 50, (Math.floor(openSquare/6) * 100) + 50);
                drawBoard();
                setTurn(-1);
                //setColor(-1);
                //handleSubmit();
            }
            else {
                gameData[openSquare] = -1;
                //drawYellowCircle(context, (selectedColumn * 100) + 50, (Math.floor(openSquare/6) * 100) + 50);
                message = {
                    type: 'makeMove',
                    message: gameData,
                    gameName: gameName,
                    gameType: "connectfour"
                };
                console.log("this is the JSON message sent: " + JSON.stringify(message));
                sendJsonMessage(message);

                drawBoard();
                setTurn(1);
                //setColor(1);
                //handleSubmit();
            }

            checkWin();
        } else {
            setCondition('notTurn')
        }
    };

    const drawBoard = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the board lines
        for (let i = 0; i <= 7; i++) {
            context.beginPath();
            context.moveTo(i * 100, 0);
            context.lineTo(i * 100, 600);
            context.stroke();
        }

        for (let i = 0; i <= 6; i++) {
            context.beginPath();
            context.moveTo(0, i * 100);
            context.lineTo(700, i * 100);
            context.stroke();
        }

        if (selectedColumn !== null) {
            context.lineWidth = 5;
            const rectX = selectedColumn * 100;
            context.strokeRect(rectX, 0, 100, 600);
            context.lineWidth = 1;
        }

        // Draw discs
        for (let i = 0; i < 42; i++) {
           
            const col = i % 7;
            const row = Math.floor(i / 7) ;
                if (gameData[i] === 1) {
                    drawYellowCircle(context, col * 100 + 50, row * 100 + 50);
                } else if (gameData[i] === -1) {
                    drawRedCircle(context, col * 100 + 50, row * 100 + 50);
                }
            


        }
    };
// yellow circles
    const drawYellowCircle = (context, x, y) => {
        context.beginPath();
        context.arc(x, y, 40, 0, 2 * Math.PI);
        context.fillStyle = 'yellow';
        context.fill();
        context.stroke();
    };
    
     //red circles
    const drawRedCircle = (context, x, y) => {
        context.beginPath();
        context.arc(x, y, 40, 0, 2 * Math.PI);
        context.fillStyle = 'red';
        context.fill();
        context.stroke();
    };

    const handleClick = (event) => {
        console.log("**********NEW CLICK**********");
        const canvas = canvasRef.current;
        const canvasRect = canvas.getBoundingClientRect();
        const x = Math.floor(event.clientX - canvasRect.left);
        const y = Math.floor(event.clientY - canvasRect.top);
        //console.log(Math.floor(x / 100) + (Math.floor(y / 100) * 7));


        const column = Math.floor(x / 100);
        setSelectedColumn(column);
        //console.log(column);
    };

    const handleBoxClick = () => {
        setCondition(false);
    };

    return (
        <div>
            {/* <AuthUser /> */}
            <Header />
            <div className={s.container}>
                <Result condition={condition} winner={win} onBoxClick={handleBoxClick}/>
                <div class={s.formContainer}>
                    <form className={s.gameForm} onSubmit={handleSubmit}>
                        <div class={s.labelButton}>
                            <label htmlFor="text">Game name</label>
                            <button type="submit" id="button">Get game data</button>
                        </div>
                        <input value={gameName} onChange={(e) => setGameName(e.target.value)} type="text" id="gamename" name="gamename" />
                        
                    </form>
                
                    <form className={s.gameMove} onSubmit={handleMove}>
                        <p class="gameSide">{color}</p>
                        <button type="submit" id="button">Submit move</button>
                    </form>
                </div>
                <div className={s.canvasContainer}>
                    <canvas ref={canvasRef} onClick={handleClick} id="connect-four-canvas" width="700" height="600">
                    </canvas>
                </div>
            </div>
        </div>
    );
}