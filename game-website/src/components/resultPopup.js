import React, { useState, useEffect } from 'react';
import s from '../CSS/result.module.css'

export default function Result({condition, winner, onBoxClick}) {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (condition) {
            setWidth(100);
        } else {
            setWidth(0);
        }
    }, [condition]);

    const handleClick = () => {
        onBoxClick();
    };

    return (
        <div className={s.box} style={{ width: `${width}vw` }} onClick={handleClick} >
            {condition && 
                <div>
                    {condition === 'null' &&
                        <p>Choose a move first</p>
                    }
                    {condition === "win" &&
                        <p>{winner.toUpperCase()} has won the game</p>
                    }
                    {condition === "notTurn" &&
                        <p>Not your turn</p>
                    }
                    {condition === "full" &&
                        <p>Tried to join a full game</p>
                    }
                    <p><i>Click here to close out</i></p>
                </div>
            }
        </div>
    )
}