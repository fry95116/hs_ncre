<% @language="vbscript" %>
<!--#include file="conn.asp"-->
<%
dim rs,sql,rs1,sql1
dim xh,password
xh=trim(request.form("xh"))
password=trim(request.form("password"))
if xh="" or password="" or  Instr(xh,"=")>0 or Instr(xh,"%")>0 or Instr(xh,chr(32))>0 or Instr(xh,"?")>0 or Instr(xh,"&")>0 or Instr(xh,";")>0 or Instr(xh,",")>0 or  Instr(xh,"'")>0 or Instr(xh,",")>0 or Instr(xh,chr(34))>0 or Instr(xh,chr(9))>0 or Instr(xh,"")>0 or Instr(xh,"$")>0 then
response.write("<script>alert('请正确输入学号和身份证号');history.back();</Script>")
response.end
end if

set rs=Server.CreateObject("Adodb.Recordset")
sql="select sfzh from xjk where xh='"&xh&"' and sfzh='"&password&"'"
rs.open sql,conn,1,1
if Trim(rs("sfzh"))<>password then
response.write( "<script>alert('请正确输入学号和身份证号，或者是当前在线人较多，请后面再试。');history.back();</Script>")
response.end


'If rs.bof And rs.eof Then
'response.write "<script>alert('无此学生信息，请确认在教务网络管理系统中的学籍状态！');history.back();</Script>"
'response.end
'End If
Else

set rs1=Server.CreateObject("Adodb.Recordset")
sql1="select * from t_bm where lxdz='"&xh&"' "
rs1.open sql1,conn,1,1
If not rs1.bof And not rs1.eof Then
Dim idhao
idhao=rs1("id")
session("userid")=idhao
Response.cookies("member")=true
Response.redirect"regview.asp"
end if
'dim bmh_id
'dbpwd=rs("password")
'bmh_id=rs("xh")

rs.close
set rs=Nothing
rs1.close
set rs1=nothing
conn.close
set conn=nothing

'If dbpwd<>password Then
'response.write "<script>alert('身份证号错误，请返回从新填写！');history.back();</Script>"
'response.end
'Else
 session("userid")=xh '调试时注意查看如果没写正确信息时此session是否有值，直接输入后续页面地址可以判断
 Response.cookies("member")=true
 Response.redirect"reg.asp"
 End if
'End If
%>

