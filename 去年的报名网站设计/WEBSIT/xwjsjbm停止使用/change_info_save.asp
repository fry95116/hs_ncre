<!--#include file="conn.asp"-->
<!--#include file="const.asp" -->
<%
If request.cookies("member")="" or session("userid")="" Then
Response.redirect"index.asp"
End If
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

If (Left(Trim(request.form("jbyydm")),1)="4" Or Left(Trim(request.form("jbyydm")),1)="1") And trim(request.form("blcjzl"))<>"0" Then 
response.write "<script>alert('一级和四级不存在补考，请选择“本次非补考”！');history.back();</Script>"
response.end
End If

if trim(request.form("blcjzl")="0") and trim(request.form("yzkzh"))<>"" then
response.write"<script>alert('对不起，您没有选择补考的种类，请确认您是否补考！');history.back();</Script>"
response.end
end if
If len(trim(request.form("sfzh")))=15 then 
csrq="19"+mid(trim(request.form("sfzh")),7,6)
end if 
if len(trim(request.form("sfzh")))=18 then
csrq=mid(trim(request.form("sfzh")),7,8)
end if 
id=session("userid")
dim rname,sex,mz,csrq,blcjzl,jbyydm,sfzh,tel1,addr1,zy,whcd,yzkzh,xq
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
xq=trim(Request.form("xqkd"))
if trim(request.form("blcjzl"))="1" or  trim(request.form("blcjzl"))="2" then 
yzkzh=trim(Request.form("yzkzh"))
else
yzkzh=""
end if
ip=request.ServerVariables("REMOTE_ADDR")

set rs_q=Server.CreateObject("adodb.recordset")
sql_q ="select * from t_bm where sfzh='"&sfzh&"' and id<>'"&id&"'"
rs_q.open sql_q,conn,1,1
If not rs_q.eof then
response.write "<script>alert('对不起，您的身份证号已经录入过了！您是否已经录入过报名信息，如果想修改或者查看，请从登陆页面输入姓名和身份证号进入。');history.back();</Script>"
response.end
End If

dim rs,sql
set rs=Server.CreateObject("Adodb.Recordset")
sql="select * from t_bm where id='"&id&"'"
rs.open sql,conn,1,3

'全新报考二级报名号9字开头
If blcjzl="0" And Left(jbyydm,1)="2" Then
id11="9"+right("000000"+id,5)
Else
id11=id
End if

If xq="1" Then 
bmh="410067"+jbyydm+id11
ElseIf xq="2" Then 
bmh="410084"+jbyydm+id11
End if
zkzh="00"+bmh
rs("bmh")=bmh
rs("zkzh")=zkzh
rs("xm")=rname
rs("xb")=sex
rs("mz")=mz
rs("csrq")=csrq
rs("blcjzl")=blcjzl
rs("sfzh")=sfzh
rs("lxdh")=tel1
rs("lxdz")=addr1
rs("zy")=zy
rs("whcd")=whcd
rs("yzkzh")=yzkzh
rs("mftime")=now()
rs("ip")=ip
rs("xq")=xq
rs("zdyxx")=addr1
rs.update
rs.close
set rs=nothing
rs_q.close
set rs_q=nothing
conn.close
set conn=nothing
response.write "<script>alert('恭喜您，资料修改成功，请查看确认！');location.href='view.asp';</Script>"
%>


