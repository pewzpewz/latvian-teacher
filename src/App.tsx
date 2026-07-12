import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Lessons } from './pages/Lessons'
import { LessonView } from './pages/LessonView'
import { VocabularyPage } from './pages/VocabularyPage'
import { DialogsPage } from './pages/DialogsPage'
import { PracticePage } from './pages/PracticePage'
import { GamesPage } from './pages/GamesPage'
import { AiTutorPage } from './pages/AiTutorPage'
import { PlanPage } from './pages/PlanPage'
import { ProgressPage } from './pages/ProgressPage'
import { SettingsPage } from './pages/SettingsPage'
import { ExamPage } from './pages/ExamPage'
import { DeclensionPage } from './pages/DeclensionPage'
import { ConjugationPage } from './pages/ConjugationPage'
import { NaturalizationPage } from './pages/NaturalizationPage'
import { DictationPage } from './pages/DictationPage'
import { CefrPage } from './pages/CefrPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="plan" element={<PlanPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="lessons" element={<Lessons />} />
          <Route path="lessons/:id" element={<LessonView />} />
          <Route path="vocabulary" element={<VocabularyPage />} />
          <Route path="dialogs" element={<DialogsPage />} />
          <Route path="dialogs/:id" element={<DialogsPage />} />
          <Route path="practice" element={<PracticePage />} />
          <Route path="declensions" element={<DeclensionPage />} />
          <Route path="conjugations" element={<ConjugationPage />} />
          <Route path="dictations" element={<DictationPage />} />
          <Route path="cefr" element={<CefrPage />} />
          <Route path="naturalization" element={<NaturalizationPage />} />
          <Route path="games" element={<GamesPage />} />
          <Route path="tutor" element={<AiTutorPage />} />
          <Route path="exam" element={<ExamPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
