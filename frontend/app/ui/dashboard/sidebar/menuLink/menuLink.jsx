"use client"

import styles from "./menuLink.module.css"
import Link from 'next/link'
import { usePathname } from "next/navigation"

const MenuLink = ({item}) => {

    const pathname = usePathname()
    return (
        <Link href={item.path} className={`${styles.container} ${pathname === item.path && styles.active}`}>
            <span className={styles.icon}>{item.icon}</span>
            {item.title}
        </Link>
    )
}

export default MenuLink