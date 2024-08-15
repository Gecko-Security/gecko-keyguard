import styles from "./sidebar.module.css"
import MenuLink from "./menuLink/menuLink";
import Image from "next/image";
import { MdLocationSearching } from "react-icons/md";
import { FaBook } from "react-icons/fa";
import { MdOutlineSecurity } from "react-icons/md";
import { RiTimer2Line } from "react-icons/ri";

import {
    MdDashboard,
    MdSupervisedUserCircle,
    MdShoppingBag,
    MdAttachMoney,
    MdWork,
    MdAnalytics,
    MdPeople,
    MdOutlineSettings,
    MdHelpCenter,
    MdLogout,
    FaBookOpen,
    MdSettings
  } from "react-icons/md";
  
  const menuItems = [
    {
      title: "",
      list: [
        {
          title: "Dashboard",
          path: "/dashboard",
          icon: <MdDashboard />,
        },
        {
          title: "Transactions",
          path: "/dashboard/transactions",
          icon: <MdLocationSearching />,
        },
        {
          title: "Fraud Detection",
          path: "/dashboard/",
          icon: <MdOutlineSecurity />,
        },
        {
          title: "Keypair Settings",
          path: "",
          icon: <MdSettings />,
        },
      ],
    },
  ];

const Sidebar = () => {
    return (
        <div className={styles.container}>
            <div className={styles.user}>
                <Image className={styles.userImage} src="/geckoo.png" alt="" width="60" height="60"/>
                <div className={styles.userDetail}>
                    <span className={styles.username}>KeyGuard</span>
                    <span className={styles.usertitle}>Non-Custodial Keypairs</span>
                </div>
            </div>
            <div className={styles.divider}></div>
            <ul className={styles.list}>
            {menuItems.map((cat) => (
                <li key={cat.title}>
                    <span className={styles.cat}>{cat.title}</span>
                    {cat.list.map(item=>(
                        <MenuLink item={item} key={item.title} />
                    ))}
                </li>
            ))}
            </ul>
        </div>
    )
}


export default Sidebar