<% @language="vbscript" %>
<!--#include file="conn.asp"-->
<%

dim rsra,sqlra,rsr1,sqlr1
dim xh,password,dhaoma
xh=trim(request.form("xh"))
password=trim(request.form("password"))
if xh="" or password="" or  Instr(xh,"=")>0 or Instr(xh,"%")>0 or Instr(xh,chr(32))>0 or Instr(xh,"?")>0 or Instr(xh,"&")>0 or Instr(xh,";")>0 or Instr(xh,",")>0 or  Instr(xh,"'")>0 or Instr(xh,",")>0 or Instr(xh,chr(34))>0 or Instr(xh,chr(9))>0 or Instr(xh,"��")>0 or Instr(xh,"$")>0 then
response.write("<script>alert('������ѧ�ź�����');history.back();</Script>")
response.end
end if

set rsra=Server.CreateObject("Adodb.Recordset")
sqlra="select * from xjk where xh='"&xh&"' and passwd='"&password&"'"
rsra.open sqlra,conn,1,1
If rsra("passwd")<>password Then
response.write "<script>alert('����ȷ����ѧ�ź����룬���Ժ��ٽ��е�½');history.back();</Script>"
response.end
end if

'If rsra.eof Then
'response.write "<script>alert('��ȷ��ѧ�ź������Ƿ���ȷ����������Ϊ�˶࣬�Ժ��Ե�½��');history.back();</Script>"
'response.end
'End If



set rsr1=Server.CreateObject("Adodb.Recordset")
sqlr1="select * from t_bm where lxdz='"&xh&"' "
rsr1.open sqlr1,conn,1,1
If not rsr1.eof Then
dhaoma=rs1("id")
session("userid")=dhaoma
Response.cookies("member")=true
Response.redirect"regchange.asp"
end if
'dim bmh_id
'dbpwd=rs("password")
'bmh_id=rs("xh")

rsra.close
set rsra=Nothing
rsr1.close
set rsr1=nothing
conn.close
set conn=nothing

'If dbpwd<>password Then
'response.write "<script>alert('���֤�Ŵ����뷵�ش�����д��');history.back();</Script>"
'response.end
'Else
 session("userid")=xh '����ʱע��鿴���ûд��ȷ��Ϣʱ��session�Ƿ���ֵ��ֱ���������ҳ���ַ�����ж�
 Response.cookies("member")=true
 Response.redirect"reg.asp"
'End If
%>

