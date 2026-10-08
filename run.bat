@echo off
REM Start Stratum (reads .env). Open http://localhost:8800
cd /d %~dp0
if not exist .env copy .env.example .env
REM Use the Spark bundled with pip pyspark 3.5.x, not a separate SPARK_HOME install
set SPARK_HOME=
set PYSPARK_PYTHON=python
set PYSPARK_DRIVER_PYTHON=python
if "%HADOOP_HOME%"=="" set HADOOP_HOME=C:\hadoop
set PATH=%HADOOP_HOME%\bin;%PATH%
python -m backend.main
