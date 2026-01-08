; 自定义 NSIS 安装脚本
; 设置默认安装目录为 D:\Program Files\产品名

!macro customInit
  StrCpy $INSTDIR "D:\Program Files\${PRODUCT_NAME}"
!macroend
