import { Route } from "react-router-dom";
import MessagesPage from "./pages/MessagesPage";
import CommunicationDashboardPage from "./pages/CommunicationDashboardPage";
import CommunicationTemplatesPage from "./pages/CommunicationTemplatesPage";
import CommunicationTemplateEditorPage from "./pages/CommunicationTemplateEditorPage";
import GlobalComponentsPage from "./pages/GlobalComponentsPage";
import CommunicationVariablesPage from "./pages/CommunicationVariablesPage";
import CommunicationThemePage from "./pages/CommunicationThemePage";
import CommunicationCategoriesPage from "./pages/CommunicationCategoriesPage";
import CommunicationHistoryPage from "./pages/CommunicationHistoryPage";
import CommunicationSettingsPage from "./pages/CommunicationSettingsPage";

// Route path stays "messages" — only the internal module name changed (to
// "communications", the long-term product surface). URL is unchanged.
//
// The new Communication System (foundation milestone) lives under
// "communications/*" — brand new routes, no existing path touched.
export const communicationsRoutes = (
  <>
    <Route path="messages" element={<MessagesPage />} />
    <Route path="messages/:id" element={<MessagesPage />} />

    <Route path="communications" element={<CommunicationDashboardPage />} />
    <Route path="communications/templates" element={<CommunicationTemplatesPage />} />
    <Route path="communications/templates/:id" element={<CommunicationTemplateEditorPage />} />
    <Route path="communications/components" element={<GlobalComponentsPage />} />
    <Route path="communications/variables" element={<CommunicationVariablesPage />} />
    <Route path="communications/theme" element={<CommunicationThemePage />} />
    <Route path="communications/template-categories" element={<CommunicationCategoriesPage />} />
    <Route path="communications/history" element={<CommunicationHistoryPage />} />
    <Route path="communications/settings" element={<CommunicationSettingsPage />} />
  </>
);
