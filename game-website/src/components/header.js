import React from "react";
import { useAuth } from '../context/user.context';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import s from "../CSS/header.module.css"

export default function Header() {
    const { token } = useAuth();
    
    if (!token) {
        return (
            <div>
                <head>
                    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>
                </head>
                <header>
                <a className={s.icon} href='/homepage'>
                    <HomeOutlinedIcon />
                </a>
                <a className={s.icon} href='/login'>
                    <PersonOutlineOutlinedIcon />
                </a>
                </header>
            </div>
        )
    }
    else{
        return (
            <div>
                <head>
                    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>
                </head>
                <header>
                <a className={s.icon} href='/homepage'>
                    <HomeOutlinedIcon></HomeOutlinedIcon>
                </a>
                <a className={s.icon} href='/user'>
                    <PersonOutlineOutlinedIcon />
                </a>
                </header>
            </div>
        )
    }
}