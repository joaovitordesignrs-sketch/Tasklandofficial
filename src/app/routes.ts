import { createBrowserRouter } from "react-router";
import HomeScreen           from "./components/HomeScreen";
import ChallengesScreen     from "./components/ChallengesScreen";
import ProfileScreen        from "./components/ProfileScreen";
import HabitsScreen         from "./components/HabitsScreen";
import AchievementsScreen   from "./components/AchievementsScreen";
import SettingsScreen       from "./components/SettingsScreen";
import FriendsScreen        from "./components/FriendsScreen";
import FriendProfileScreen  from "./components/FriendProfileScreen";
import ClassSelectionScreen from "./components/ClassSelectionScreen";
import RootLayout           from "./components/RootLayout";
import RedirectToProfile    from "./components/RedirectToProfile";
import AdminWipeScreen      from "./components/AdminWipeScreen";
import DesignSystemScreen   from "./components/DesignSystemScreen";
import ShopScreen           from "./components/ShopScreen";
import GameMasterScreen     from "./components/GameMasterScreen";

export const router = createBrowserRouter([
  {
    // Admin panel is outside the normal game layout
    path: "/admin-wipe",
    Component: AdminWipeScreen,
  },
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true,              Component: HomeScreen         },
      { path: "desafios",         Component: ChallengesScreen   },
      { path: "perfil",           Component: ProfileScreen      },
      { path: "habitos",          Component: HabitsScreen       },
      { path: "conquistas",       Component: AchievementsScreen },
      { path: "configuracoes",    Component: SettingsScreen     },
      { path: "amigos",           Component: FriendsScreen      },
      { path: "amigos/:friendId", Component: FriendProfileScreen },
      { path: "classe",           Component: ClassSelectionScreen },
      { path: "design_system",    Component: DesignSystemScreen  },
      { path: "loja",             Component: ShopScreen          },
      { path: "game-master",      Component: GameMasterScreen    },
      // Legacy route redirects → /perfil
      { path: "progresso",        Component: RedirectToProfile  },
      { path: "historico",        Component: RedirectToProfile  },
      { path: "renascer",         Component: RedirectToProfile  },
    ],
  },
]);
