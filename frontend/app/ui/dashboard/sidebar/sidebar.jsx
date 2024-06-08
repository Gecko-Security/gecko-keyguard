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
    FaBookOpen
  } from "react-icons/md";
  
  const menuItems = [
    {
      title: "Home",
      list: [
        {
          title: "Dashboard",
          path: "/dashboard",
          icon: <MdDashboard />,
        },
        {
          title: "Transactions",
          path: "/dashboard/scan",
          icon: <MdLocationSearching />,
        },
        {
          title: "Vulnerability Detectors",
          path: "https://github.com/Gecko-Security",
          icon: <MdOutlineSecurity />
          ,
        }
      ],
    },
    {
      title: "Coming Soon",
      list: [
        {
          title: "Fuzzing",
          path: "/dashboard/revenue",
          icon: <RiTimer2Line />,
        },
        {
          title: "Formal Verification",
          path: "/dashboard/reports",
          icon: <RiTimer2Line />,
        },
        {
          title: "Audits",
          path: "/dashboard/teams",
          icon: <RiTimer2Line />,
        },
      ],
    },
  ];

const Sidebar = () => {
    return (
        <div className={styles.container}>
            <div className={styles.user}>
                <Image className={styles.userImage} src="/gecko.png" alt="" width="110" height="110"/>
                <div className={styles.userDetail}>
                    <span className={styles.username}>DKMI</span>
                    <span className={styles.usertitle}>Non-Custodial Keypairs</span>
                </div>
            </div>
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
            <button className={styles.logout}>
              <MdLogout/>
              Logout
            </button>
        </div>
    )
}


export default Sidebar