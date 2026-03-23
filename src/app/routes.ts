import { createBrowserRouter, type RouteObject } from "react-router";
import { lazy } from "react";
import HomeScreen  from "./components/HomeScreen";
import RootLayout  from "./components/RootLayout";

// Lazy-loaded routes — split into separate chunks to reduce initial bundle
const ChallengesScreen     = lazy(() => import("./components/ChallengesScreen"));
const ProfileScreen        = lazy(() => import("./components/ProfileScreen"));
const HabitsScreen         = lazy(() => import("./components/HabitsScreen"));
const AchievementsScreen   = lazy(() => import("./components/AchievementsScreen"));
const SettingsScreen       = lazy(() => import("./components/SettingsScreen"));
const FriendsScreen        = lazy(() => import("./components/FriendsScreen"));
const FriendProfileScreen  = lazy(() => import("./components/FriendProfileScreen"));
const ClassSelectionScreen = lazy(() => import("./components/ClassSelectionScreen"));
const RedirectToProfile    = lazy(() => import("./components/RedirectToProfile"));
const AdminWipeScreen      = lazy(() => import("./components/AdminWipeScreen"));
const DesignSystemScreen   = lazy(() => import("./components/DesignSystemScreen"));
const ShopScreen           = lazy(() => import("./components/ShopScreen"));
const GameMasterScreen     = lazy(() => import("./components/GameMasterScreen"));
const ProductPage          = lazy(() => import("./components/ProductPage"));

export const router = createBrowserRouter([
  {
    // Product landing page — outside the game layout (for unauthenticated visitors)
    path: "/produto",
    Component: ProductPage,
  },
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
] satisfies RouteObject[]);
