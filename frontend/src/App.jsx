import { Routes, Route } from 'react-router-dom'
import { Container, Typography } from '@mui/material'

function App() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mentor Portal
      </Typography>
      <Routes>
        <Route path="/" element={<Typography>Welcome to the Mentor-Mentee Portal</Typography>} />
      </Routes>
    </Container>
  )
}

export default App
