import { Component } from 'react';
import { Alert, Button } from '@mui/material';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => this.setState({ hasError: false, error: null })}>
              Retry
            </Button>
          }
        >
          {this.props.fallback || 'Something went wrong rendering this section.'}
        </Alert>
      );
    }
    return this.props.children;
  }
}
