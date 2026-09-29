import { HashRouter, Navigate, Route, Routes } from "react-router";

import { Layout } from "@/components/Layout/Layout";
import { DevboardProvider } from "@/context/DevboardProvider";
import { BoardsPage } from "@/pages/Boards/BoardsPage";
import { BoardDetailPage } from "@/pages/BoardDetail/BoardDetailPage";
import { ProfilePage } from "@/pages/Profile/ProfilePage";
import { NotFoundPage } from "@/pages/NotFound/NotFoundPage";

export default function App() {
  return (
    <DevboardProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/boards" replace />} />
            <Route path="boards" element={<BoardsPage />} />
            <Route path="board/:boardId" element={<BoardDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </DevboardProvider>
  );
}
