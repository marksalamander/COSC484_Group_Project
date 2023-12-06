import React from "react"
import "../App.css"
import s from "../CSS/homepage.module.css"
import Header from "../components/header"
import TicTacToe from "../images/TicTacToe.png"
import Checkers from "../images/checker-board.png"
import ConnectFour from "../images/ConnectFour.jpg"

export default function Homepage() {
    return (
        <div id="root">
            <head>
            </head>
                <Header />
            <body>
                <div id={s.bodyContainer}>
                    <div id={s.listContainer}>
                        
                        <div className={s.gameContainer}>
                            <div className={s.game}>
                                <a href='/TicTacToe'>
                                    <img className={s.gameImage} src={TicTacToe} alt="Tic-Tac-Toe"></img>
                                </a>
                                <div className={s.gameImage_outline}></div>
                            </div>
                            <div className={s.gameName}>
                                Tic-Tac-Toe
                            </div>
                        </div>

                        <div className={s.gameContainer}>
                            <div className={s.game}>
                                <a href="/checkers">
                                    <img className={s.gameImage} src={Checkers} alt="Checkers"></img>
                                </a>
                                <div className={s.gameImage_outline}></div>
                            </div>
                            <div className={s.gameName}>
                                Checkers
                            </div>
                        </div>

                        <div className={s.gameContainer}>
                            <div className={s.game}>
                                <a href="/connect-four">
                                    <img className={s.gameImage} src={ConnectFour} alt="Connect Four"></img>
                                </a>
                                <div className={s.gameImage_outline}></div>
                            </div>
                            <div className={s.gameName}>
                                Connect Four
                            </div>
                        </div>
        
                    </div>
                </div>
            </body>
        </div>
    )
}