import React, { useState, useEffect } from 'react';
import s from '../CSS/login.module.css'

export default function Invalid({condition, invalid}) {
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        {invalid ? (
            setOpacity(100)
        ) : (
            setOpacity(0)
        )}
    }, [invalid]);

    return (
        <div>
            {invalid && 
                <div id={s.invalidContainer} style={{ opacity: `${opacity}` }}>
                    {condition === "incorrect" &&
                        <p><i>Username or password is incorrect</i></p>
                    }
                    {condition === "exists" &&
                        <p><i>User already exists</i></p>
                    }
                    {condition === "userShort" &&
                        <p><i>Username must be at least 6 characters long</i></p>
                    }
                    {condition === "passShort" &&
                        <p><i>Passwords must be at least 8 characters long</i></p>
                    }
                    {condition === "notMatch" &&
                        <p><i>Passwords do not match</i></p>
                    }
                </div>
            }
        </div>
    )
}