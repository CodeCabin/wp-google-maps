@echo.
@echo %date%%time% :- COMBINING JS

@php build.php

@if %errorlevel% neq 0 (
	@echo.
	@pause 
	@exit /b %errorlevel%
)

@echo.
@echo %date%%time% :- MINIFYING JS (BASIC ONLY)

@cmd /c uglifyjs ../../js/v8/wp-google-maps.combined.js -c -o ../../js/v8/wp-google-maps.min.js

@if %errorlevel% neq 0 (
	@echo.
	@pause 
	@exit /b %errorlevel%
)

@echo.
@echo %date%%time% :- MINIFYING JS (BASIC + PRO)

@cmd /c uglifyjs ../../../wp-google-maps-pro/js/v8/wp-google-maps-pro.combined.js -c -o ../../../wp-google-maps-pro/js/v8/wp-google-maps-pro.min.js

@if %errorlevel% neq 0 (
	@echo.
	@pause 
	@exit /b %errorlevel%
)

@echo.
@echo %date%%time% :- BUILD AND MINIFY SUCCESSFUL

@exit /b

REM cmd /c uglifyjs ./wp-google-maps-gold/js/wp-google-maps-gold.combined.js -c -o ./wp-google-maps-gold/js/wp-google-maps-gold.min.js
REM if %errorlevel% neq 0 exit /b %errorlevel%

REM cmd /c uglifyjs ./wp-google-maps-ugm/js/wp-google-maps-ugm.combined.js -c -o ./wp-google-maps-ugm/js/wp-google-maps-ugm.min.js
REM if %errorlevel% neq 0 exit /b %errorlevel%