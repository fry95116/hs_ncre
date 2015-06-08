<!--#include file="const.asp" -->
<%
response.buffer="True"
if trim(request.form("rname"))="" or  trim(request.form("sex"))="" or  trim(request.form("mz"))="" or   trim(request.form("jbyydm"))="" or   trim(request.form("addr1"))=""  then 
response.write "<script>alert('你输入全部要求输入的信息了吗？！');history.back();</Script>"
response.end
end if

If len(request.form("sfzh"))<>15 and len(request.form("sfzh"))<>18 Then
response.write "<script>alert('你输入的身份证号码数目不对！');history.back();</Script>"
response.end
End If


if trim(request.form("blcjzl"))<>"0" and (mid(trim(request.form("yzkzh")),3,2)<>kscs  or  len(trim(request.form("yzkzh")))<>16 or left(trim(request.form("yzkzh")),2)<>trim(request.form("jbyydm"))) then
response.write"<script>alert('对不起，您的原准考证号码输入错误，原准考证号应该为"&kscs&"次16位准考证号,且应该与本次报考级别语言相同！');history.back();</Script>"
response.end
end if


if trim(request.form("blcjzl")="0") and trim(request.form("yzkzh"))<>"" then
response.write"<script>alert('对不起，您填写了原准考证号但没有选择保留成绩的种类，请确认您是否补考！');history.back();</Script>"
response.end
end if

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
dim rname,sex,mz,blcjzl,jbyydm,sfzh,tel1,addr1,zy,whcd,yzkzh,idno,bmh,zhzh
rname=trim(Request.form("rname"))
sex=trim(Request.form("sex"))
mz=trim(Request.form("mz"))
blcjzl=trim(Request.form("blcjzl"))
jbyydm=trim(Request.form("jbyydm"))
sfzh=trim(Request.form("sfzh"))
tel1=trim(Request.form("tel1"))
addr1=trim(Request.form("addr1"))
zy=trim(Request.form("zy"))
whcd=trim(Request.form("whcd"))
if trim(request.form("blcjzl"))="1" or  trim(request.form("blcjzl"))="2" then 
yzkzh=trim(Request.form("yzkzh"))
else
yzkzh=""
end if
ip=request.ServerVariables("REMOTE_ADDR")

set rs_t=Server.CreateObject("adodb.recordset")
sql_t ="select * from t_bm where sfzh='"&sfzh&"'"
rs_t.open sql_t,conn,1,1
If not rs_t.eof then
response.write "<script>alert('对不起，您的身份证号已经录入过了！');history.back();</Script>"
response.end
End If

set rs3=Server.CreateObject("Adodb.Recordset")
sql3="select max(id)  from t_bm"
rs3.open sql3,conn,1,1

idno=right("000000"+cstr(cint(rs3(0))+1),6)
bmh="410084"+jbyydm+idno
zkzh="00"+bmh

set rs1=Server.CreateObject("Adodb.Recordset")
sql1="insert into t_bm(id,bmh,zkzh,xm,xb,csrq,mz,sfzh,zy,whcd,yzkzh,blcjzl,kspxzl,lxdz,lxdh,dgcl,dgcp,havexp,mftime,ip)  values('"& idno &"','"&bmh&"','"&zkzh&"','"&rname&"','"&sex&"','"&csrq&"','"&mz&"','"&sfzh&"','"&zy&"','"&whcd&"','"&yzkzh&"','"&blcjzl&"','3','"&addr1&"','"&tel1&"','0','0','2','"&now()&"','"&ip&"')"
Set RS1=Conn.Execute(SQL1)

rs_t.close
set rs_t=nothing
rs1.close
set rs1=nothing
rs3.close
set rs3=nothing
conn.close
set conn=nothing
'session("bmh")=idno
session("userid")=idno
Response.cookies("member")=true
response.redirect"view.asp"
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
