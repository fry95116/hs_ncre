<% @language="vbscript" %>
<!--#include file="conn.asp"-->
<%
dim rs,sql
dim xm,sfzh
xm=trim(request.form("xm"))
sfzh=trim(request.form("sfzh"))
if xm="" or sfzh="" or  Instr(xm,"=")>0 or Instr(xm,"%")>0 or Instr(xm,chr(32))>0 or Instr(xm,"?")>0 or Instr(xm,"&")>0 or Instr(xm,";")>0 or Instr(xm,",")>0 or  Instr(xm,"'")>0 or Instr(xm,",")>0 or Instr(xm,chr(34))>0 or Instr(xm,chr(9))>0 or Instr(xm,"��")>0 or Instr(xm,"$")>0 then
response.write("<script>alert('����ȷ�������������֤��1');history.back();</Script>")
response.end
end if

set rs=Server.CreateObject("Adodb.Recordset")
sql="select * from t_bm where xm='"&xm&"' and sfzh='"&sfzh&"'"
rs.open sql,conn,1,1
if rs("sfzh")<>sfzh then
response.write "<script>alert('����ȷ�������������֤��2');history.back();</Script>"
 response.end
 end if

If rs.eof Then
response.write "<script>alert('�޴˱�����Ϣ����ȷ�ϣ�');history.back();</Script>"
response.end
End If

dim bmh_id
'dbpwd=rs("sfzh")
bmh_id=rs("id")

rs.close
set rs=nothing
conn.close
set conn=nothing

'If dbpwd<>sfzh Then
'response.write "<script>alert('���֤�Ŵ����뷵�ش�����д��');history.back();</Script>"
'response.end
'Else
 session("userid")=bmh_id
 Response.cookies("member")=true
 Response.redirect"view.asp"
'End If
%>

