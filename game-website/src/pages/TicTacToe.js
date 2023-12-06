import React, { useEffect, useState, useRef } from "react"
import Header from "../components/header"
import useWebSocket from 'react-use-websocket';
import AuthUser from '../components/authUser'
import s from "../CSS/tictactoe.module.css"
import { useAuth } from '../context/user.context';
import Result from '../components/resultPopup'
import '../CSS/gameForm.css'


export default function TicTacToe() {
    const { token } = useAuth();
    var [gameName, setGameName] = useState('');
    const { sendJsonMessage, lastJsonMessage } = useWebSocket('wss://games.zenithgaming.horse/ws', {
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 1,
        reconnectAttempts: 5,
    });
    const [gameData, setGameData] = useState([]);//The current board for the game
    const [selectedBoxes, setSelectedBoxes] = useState([]);
    const [side, setSide] = useState('');
    const [turn, setTurn] = useState('');
    const [winner, setWinner] = useState('');
    const [condition, setCondition] = useState('');


    const canvasRef = useRef(null);


    useEffect(() => {
        console.log(JSON.stringify(lastJsonMessage));
        if (lastJsonMessage !== null) {//Whenever a json message is received, refresh gameData 
            if (lastJsonMessage.type === "success") {
                setSide(lastJsonMessage.side);
            } else if (lastJsonMessage.error) {
                if (lastJsonMessage.error === "GAME_FULL") {
                    setCondition('full');
                }
            } else if (lastJsonMessage.type === "update") {
                setGameData(lastJsonMessage.game.currentBoard);
                setTurn(lastJsonMessage.game.nextToMove);
            } else if (lastJsonMessage.type === "winner") {
                setWinner(lastJsonMessage.winner);
                console.log("winner is " + lastJsonMessage.winner);
            }
        } else {
            setGameData(["e", "e", "e", "e", "e", "e", "e", "e", "e",]);
        }
    }, [lastJsonMessage]);


    useEffect(() => {
        if (winner) {
            setCondition("win")
        }
    },[winner])

    useEffect(() => {
        if (gameData != null) {
            drawBoard();
        }
    },[gameData, selectedBoxes]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const message = {
            type: 'connectGame',
            gameName: gameName,
            session_id: token,
            gameType: "tictactoe"
        }

        sendJsonMessage(message);//Sends a json message to the node server to request data for gameName


    }

    const handleMove = (e) => {
        e.preventDefault();
        console.log(turn + " : " + side);
        if (selectedBoxes == null) {
            alert("Choose a move first.")
        } else if (winner === 'x' || winner === 'y') {
            setCondition('win')
        } else if (turn === side) {
            const message = {
                type: 'makeMove',
                message: [selectedBoxes, side],
                gameName: gameName,
                gameType: "tictactoe"
            }
            console.log(message);
            sendJsonMessage(message);
        } else{
            setCondition('notTurn')
        }


    }

    const drawBoard = () => {

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        //Draws the board lines
        context.beginPath();
        context.moveTo(0, 100);
        context.lineTo(300, 100);
        context.stroke();

        context.beginPath();
        context.moveTo(0, 200);
        context.lineTo(300, 200);
        context.stroke();


        context.beginPath();
        context.moveTo(100, 0);
        context.lineTo(100, 300);
        context.stroke();

        context.beginPath();
        context.moveTo(200, 0);
        context.lineTo(200, 300);
        context.stroke();
        if (selectedBoxes != null) {
            context.lineWidth = 5;
            const rectx = ((selectedBoxes) % 3) * 100;
            const recty = Math.trunc((selectedBoxes / 3)) * 100;
            context.strokeRect(rectx, recty, 100, 100)
            context.lineWidth = 1;
        }
        for (let i = 0; i < 9; i = i+3) {
            for (let j = 0; j < 3; j++) {//Draws x
                if (gameData[i + j] === 'x') {
                    console.log('drawing x at ' + (i+j))
                    context.beginPath();
                    context.moveTo(j * 100 + 20, i/3 * 100 + 20);
                    context.lineTo(j * 100 + 80, i/3 * 100 + 80);
                    context.stroke();
        
                    context.beginPath();
                    context.moveTo(j * 100 + 80, i/3 * 100 + 20);
                    context.lineTo(j * 100 + 20, i/3 * 100 + 80);
                    context.stroke();
                } else if (gameData[i+j] === 'o') {//draws o
                    context.beginPath();
                    context.arc(j * 100 + 50, i/3 * 100 + 50, 40, 0, 2 * Math.PI);
                    context.stroke();
                }
            }
        }
    }

    const handleClick = (event) => {//Prints the current location of the mouse relative to the canvas when the canvas is clicked
        const canvas = canvasRef.current;
        const canvasRect = canvas.getBoundingClientRect();
        const x = Math.trunc(event.clientX - canvasRect.left);
        const y = Math.trunc(event.clientY - canvasRect.top);

        const cell = Math.trunc(x / 100) + (Math.trunc(y / 100) * 3);
        setSelectedBoxes(cell);
        console.log(cell);
    };

    const handleBoxClick = () => {
        setCondition(false);
    };

    return (
        <div>
            {/* <AuthUser /> */}
            <Header />
            
            <div className={s.container}>
                <Result condition={condition} winner={winner} onBoxClick={handleBoxClick}/>
                <div class={s.formContainer}>
                    <form className={s.gameForm} onSubmit={handleSubmit}>
                        <div class={s.labelButton}>
                            <label for="text">Game name</label>
                            <button type="submit" id="button">Get game data</button>
                        </div>
                        <input value={gameName} onChange={(e) => setGameName(e.target.value)} type="text" id="gamename" name="gamename"></input>
                    </form>
                </div>
                <div className={s.canvasContainer}>
                    <canvas ref={canvasRef} onClick={handleClick} id="tic-tac-toe-canvas" width="300" height="300">
                    </canvas>
                </div>
                {side &&
                    <form className={s.gameSubmit} onSubmit={handleMove}>
                        <p>{side.toUpperCase()}</p>
                        <button type="submit" id="button">Submit move</button>
                    </form>
                }
                <div>
                
            </div>
            </div>
        </div>
    )
}