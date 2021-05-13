import {createContext, useState} from 'react';

export const AlertContext = createContext(null);

const AlertProvider = ({children}) => {

  const [alert, setAlert] = useState("NONE");
  const [alertText, setAlertText] = useState(null);

  const success = (text, timeout) => {
    setAlertText(text);
    setAlert("SUCCESS");
    setTimeout(() => {
      setAlert("NONE");
    }, timeout * 1000 || 10000)
  }

  const error = (text, timeout) => {
    setAlertText(text);
    setAlert("ERROR");
    setTimeout(() => {
      setAlert("NONE");
    }, timeout * 1000 || 10000)
  }

  return (
    <AlertContext.Provider
      value={{
        alert: alert,
        alertText: alertText,
        success: success,
        error: error,
        clear: () => (setAlert("NONE")),
      }}
    >
      {children}
    </AlertContext.Provider>
  )
}

export {AlertProvider};
export default AlertContext;