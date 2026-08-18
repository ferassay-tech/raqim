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
import { RequirePermission } from "@/admin/components/ui/RequirePermission";

// Route path stays "messages" — only the internal module name changed (to
// "communications", the long-term product surface). URL is unchanged.
//
// The new Communication System (foundation milestone) lives under
// "communications/*" — brand new routes, no existing path touched.
//
// Two distinct permissions from the existing vocabulary: messages.view
// gates the Messages inbox (a different feature from Communications), and
// communications.manage gates every communications/* route below it (one
// permission for the whole module, matching the seed — no separate .view
// key exists for it).
export const communicationsRoutes = (
  <>
    <Route
      path="messages"
      element={
        <RequirePermission permission="messages.view">
          <MessagesPage />
        </RequirePermission>
      }
    />
    <Route
      path="messages/:id"
      element={
        <RequirePermission permission="messages.view">
          <MessagesPage />
        </RequirePermission>
      }
    />

    <Route
      path="communications"
      element={
        <RequirePermission permission="communications.manage">
          <CommunicationDashboardPage />
        </RequirePermission>
      }
    />
    <Route
      path="communications/templates"
      element={
        <RequirePermission permission="communications.manage">
          <CommunicationTemplatesPage />
        </RequirePermission>
      }
    />
    <Route
      path="communications/templates/:id"
      element={
        <RequirePermission permission="communications.manage">
          <CommunicationTemplateEditorPage />
        </RequirePermission>
      }
    />
    <Route
      path="communications/components"
      element={
        <RequirePermission permission="communications.manage">
          <GlobalComponentsPage />
        </RequirePermission>
      }
    />
    <Route
      path="communications/variables"
      element={
        <RequirePermission permission="communications.manage">
          <CommunicationVariablesPage />
        </RequirePermission>
      }
    />
    <Route
      path="communications/theme"
      element={
        <RequirePermission permission="communications.manage">
          <CommunicationThemePage />
        </RequirePermission>
      }
    />
    <Route
      path="communications/template-categories"
      element={
        <RequirePermission permission="communications.manage">
          <CommunicationCategoriesPage />
        </RequirePermission>
      }
    />
    <Route
      path="communications/history"
      element={
        <RequirePermission permission="communications.manage">
          <CommunicationHistoryPage />
        </RequirePermission>
      }
    />
    <Route
      path="communications/settings"
      element={
        <RequirePermission permission="communications.manage">
          <CommunicationSettingsPage />
        </RequirePermission>
      }
    />
  </>
);
