!macro customInstall
  DetailPrint "Register coinevo URI Handler"
  DeleteRegKey HKCR "coinevo"
  WriteRegStr HKCR "coinevo" "" "URL:coinevo"
  WriteRegStr HKCR "coinevo" "URL Protocol" ""
  WriteRegStr HKCR "coinevo\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCR "coinevo\shell" "" ""
  WriteRegStr HKCR "coinevo\shell\Open" "" ""
  WriteRegStr HKCR "coinevo\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1"
!macroend