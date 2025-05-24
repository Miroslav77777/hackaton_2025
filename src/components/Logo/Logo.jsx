import React from "react";
import styles from './Logo.module.css';
import Lightning from '../../assets/free-icon-font-bolt-6853811 1.svg?react'
import { observer } from 'mobx-react-lite';
import themeStore from '../../stores/ThemeStore';

const Logo = observer(() => {
    return(
        <a className={styles.logo_wrapper} href="./home">
            <h1 className={styles.text_g}>Тени</h1> <h1 className={themeStore.mode === 'dark' ? styles.text_w : styles.text_wb}>Watt</h1> <Lightning className={styles.lightning}/>
        </a>
    )
})

export default Logo;