<%
dim conn,connstr
on error resume next
connstr="DBQ="+server.mappath("database/fdasfasdNIH435346767.asp")+";DefaultDir=;DRIVER={Microsoft Access Driver (*.mdb)};"
Set conn=Server.CreateObject("ADODB.CONNECTION")
conn.open connstr
%>



