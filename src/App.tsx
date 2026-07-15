import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import { GrammarPage } from './pages/GrammarPage'
import { DeclensionPage } from './pages/DeclensionPage'
import { ConjugationPage } from './pages/ConjugationPage'
import { NaturalizationPage } from './pages/NaturalizationPage'
import { TrainingHub } from './pages/TrainingHub'
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

          <Route path="grammar" element={<GrammarPage />}>
            <Route index element={<Navigate to="declensions" replace />} />
            <Route path="declensions" element={<DeclensionPage />} />
            <Route path="conjugations" element={<ConjugationPage />} />
          </Route>

          <Route path="training" element={<TrainingHub />}>
            <Route index element={<Navigate to="pronunciation" replace />} />
            <Route path="pronunciation" element={<PracticePage />} />
            <Route path="dictation" element={<DictationPage />} />
            <Route path="games" element={<GamesPage />} />
          </Route>

          <Route path="cefr" element={<CefrPage />} />
          <Route path="naturalization" element={<NaturalizationPage />} />
          <Route path="tutor" element={<AiTutorPage />} />
          <Route path="exam" element={<ExamPage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* Old flat routes — redirects so bookmarks/links keep working */}
          <Route path="declensions" element={<Navigate to="/grammar/declensions" replace />} />
          <Route path="conjugations" element={<Navigate to="/grammar/conjugations" replace />} />
          <Route path="practice" element={<Navigate to="/training/pronunciation" replace />} />
          <Route path="dictations" element={<Navigate to="/training/dictation" replace />} />
          <Route path="games" element={<Navigate to="/training/games" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
