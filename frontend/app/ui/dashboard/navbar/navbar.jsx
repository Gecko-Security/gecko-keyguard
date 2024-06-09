"use client";
import { usePathname } from "next/navigation";
import styles from "./navbar.module.css";
import {
  MdNotifications,
  MdOutlineChat,
  MdPublic,
  MdSearch,
} from "react-icons/md";


const Navbar = () => {

    const pathname = usePathname();

    return (
        <div className={styles.container}>
            <div className={styles.title}>{pathname.split("/").pop()}</div>
            <div className={styles.menu}>
                <div className={styles.search}>
                    <MdSearch className={styles.searchIcon} />
                    <input type="text" placeholder="Search Transactions" className={styles.input} />
                </div>
            </div>
        </div>
    )
}

export default Navbar