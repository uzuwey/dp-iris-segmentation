import React, { useContext } from "react";
import { AlertContext } from "../../helpers/contexts/AlertContext";

import "./Alert.css";

const Alert = () => {
  const alert = useContext(AlertContext);

  return (
    <div className="alert-container">
      {
        (alert.alert !== "NONE") && (
          <div className={`alert ${(alert.alert === "SUCCESS") ? 'alert-primary': 'alert-danger'} alert-dismissible fade show`} role="alert" >
            {alert.alertText}
            <button type="button" className="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        )
      }
    </div>
  )
}

export default Alert;