import React from "react";
import styles from './Logo.module.css';
import Lightning from '../../assets/free-icon-font-bolt-6853811 1.svg?react'


const Logo = () => {
    return(
        <a className={styles.logo_wrapper} href="./home">
            <h1 className={styles.text_g}>Тени</h1> <h1 className={styles.text_w}>Watt</h1> <Lightning className={styles.lightning}/>
        </a>
    )
}

export default Logo;