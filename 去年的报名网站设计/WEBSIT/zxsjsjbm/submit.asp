
<%
response.buffer="True"

If Trim(request.Form("sfcx"))="" Then 
response.write "<script>alert('����δǩ����ų�ŵ�飬���ͬ���빴ѡ��');history.back();</Script>"
response.End
End if

if trim(request.form("rname"))="" or  trim(request.form("sex"))="" or  trim(request.form("mz"))="" or   trim(request.form("jbyydm"))="" or  trim(request.form("addr1"))=""  or Trim(request.Form("tell"))=""  or Trim(request.Form("xqkd"))="" then 
response.write "<script>alert('������ȫ��Ҫ���������Ϣ���𣿣�');history.back();</Script>"
response.end
end if

If len(request.form("sfzh"))<>15 and len(request.form("sfzh"))<>18 Then
response.write "<script>alert('����������֤������Ŀ���ԣ�');history.back();</Script>"
response.end
End If


If len(trim(request.form("sfzh")))=15 then 
csrq="19"+mid(trim(request.form("sfzh")),7,6)
end if 
if len(trim(request.form("sfzh")))=18 then
csrq=mid(trim(request.form("sfzh")),7,8)
end if 
%>
<!--#include file="conn.asp"-->
<%
dim rs_t,rs3,rs1
dim sql_t,sql3,sql1
dim rname,sex,mz,blcjzl,jbyydm,sfzh,tell,addr1,zy,whcd,yzkzh,idno,bmh,zkzh,xq,qscx,myzdy
rname=trim(Request.form("rname"))
sex=trim(Request.form("sex"))
mz=trim(Request.form("mz"))
blcjzl="0"
jbyydm=trim(Request.form("jbyydm"))
sfzh=trim(Request.form("sfzh"))
tell=trim(Request.form("tell"))
addr1=trim(Request.form("addr1"))
zy=trim(Request.form("zy"))
whcd=trim(Request.form("whcd"))
xq=Trim(Request.form("xqkd"))
yzkzh=""

ip=request.ServerVariables("REMOTE_ADDR")
qscx=Trim(request.Form("sfcx"))
myzdy=Trim(request.Form("myzdy"))

set rs_t=Server.CreateObject("adodb.recordset")
sql_t ="select * from t_bm where sfzh='"&sfzh&"' or lxdz='"&addr1&"'"
rs_t.open sql_t,conn,1,1
If not rs_t.eof then
response.write "<script>alert('�Բ����������֤�Ż���ѧ���Ѿ�¼����ˣ������µ�½�鿴������Ϣ��');history.back();</Script>"
response.end
End If





set rs3=Server.CreateObject("Adodb.Recordset")
sql3="select max(id)  from t_bm"
rs3.open sql3,conn,1,1
idno=right("000000"+cstr(cint(rs3(0))+1),6)



id12=idno


If xq="1" Then 
set rs_t11=Server.CreateObject("adodb.recordset")
sql_t11 ="select count(*) from t_bm where left(bmh,6)='410067'"
rs_t11.open sql_t11,conn,1,1
If rs_t11(0)>=900 then
response.write "<script>alert('�Բ��𣬻�԰У������λ���������ٽ��ܱ�����');history.back();</Script>"
response.end
End If


bmh="410067"+jbyydm+id12
ElseIf xq="2" Then 
set rs_t12=Server.CreateObject("adodb.recordset")
sql_t12 ="select count(*) from t_bm where left(bmh,6)='410084'"
rs_t12.open sql_t12,conn,1,1
If rs_t12(0)>=3300 then
response.write "<script>alert('�Բ������Ӻ�У������λ���������ٽ��ܱ�����');history.back();</Script>"
response.end
End If

bmh="410084"+jbyydm+id12
End If 
zkzh="00"+bmh

set rs1=Server.CreateObject("Adodb.Recordset")
sql1="insert into t_bm(id,bmh,zkzh,xm,xb,csrq,mz,sfzh,zy,whcd,yzkzh,blcjzl,kspxzl,lxdz,lxdh,dgcl,dgcp,havexp,mftime,ip,xq,cxcn,zdyxx)  values('"& idno &"','"&bmh&"','"&zkzh&"','"&rname&"','"&sex&"','"&csrq&"','"&mz&"','"&sfzh&"','"&zy&"','"&whcd&"','"&yzkzh&"','"&blcjzl&"','3','"&addr1&"','"&tell&"','0','0','2','"&now()&"','"&ip&"','"&xq&"','"&qscx&"','"&myzdy&"')"
Set RS1=Conn.Execute(SQL1)

rs_t.close
set rs_t=Nothing
rs_t11.close
set rs_t11=Nothing
rs_t12.close
set rs_t12=nothing
rs1.close
set rs1=nothing
rs3.close
set rs3=nothing
conn.close
set conn=nothing
'session("bmh")=idno
session("userid")=idno
Response.cookies("member")=true
response.redirect"regview.asp"
%>
<html>

<head>
<meta http-equiv="Content-Type" content="text/html; charset=gb2312">
<meta name="GENERATOR" content="Microsoft FrontPage 4.0">
<meta name="ProgId" content="FrontPage.Editor.Document">
<title></title>
</head>

<body>

</body>

</html>
