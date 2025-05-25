import React from "react";
import styles from './SideItem.module.css';
import { observer } from 'mobx-react-lite';
import themeStore from '../../stores/ThemeStore';

const SideItem = observer(({icon, text, isActive, a_icon}) => {
    return(
        <div className={isActive ? styles.item_wrapper_active : styles.item_wrapper}>
            {isActive ? a_icon : icon}
            <h1 className={isActive ? styles.name_active : themeStore.mode === 'dark' ? styles.name : styles.name_blk}>{text}</h1>
        </div>
    )
})

export default SideItem;