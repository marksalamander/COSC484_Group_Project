import React, { useEffect, useState, useRef } from "react"
import Header from "../components/header"
import Checkerboard from "../components/checkerboard.js"
import AuthUser from '../components/authUser'
import s from "../CSS/checkers.module.css"
import useWebSocket from 'react-use-websocket';


//both pieces can be moved but black pieces turn red when moved so that needs to be fixed which should be easy
//if i pick one piece then a different piece of the same color then try to move second piece bad things happen
//need to implement king pieces
//implement win condition
export default function Checkers() {
    return (
        <div>
            <Header />
            <div id={s.container}>
                <div id={s.canvasContainer}>
                    <Checkerboard />
                </div>
            </div>
        </div>
    )
}