<!--#include file="conn.asp"-->
<!--#include file="const.asp" -->
<%
If request.cookies("member")="" or session("userid")="" Then
Response.redirect"index.asp"
End If
if trim(request.form("rname"))="" or  trim(request.form("sex"))="" or  trim(request.form("mz"))="" or   trim(request.form("jbyydm"))="" or   trim(request.form("addr1"))=""  then 
response.write "<script>alert('������ȫ��Ҫ���������Ϣ���𣿣�');history.back();</Script>"
response.end
end if

If len(request.form("sfzh"))<>15 and len(request.form("sfzh"))<>18 Then
response.write "<script>alert('����������֤������Ŀ���ԣ�');history.back();</Script>"
response.end
End If


    if trim(request.form("blcjzl"))<>"0" and (mid(trim(request.form("yzkzh")),3,2)<>kscs  or  len(trim(request.form("yzkzh")))<>16 or left(trim(request.form("yzkzh")),2)<>trim(request.form("jbyydm"))) then
response.write"<script>alert('�Բ�������ԭ׼��֤�����������ԭ׼��֤��Ӧ��Ϊ"&kscs&"��16λ׼��֤��,��Ӧ���뱾�α�������������ͬ��');history.back();</Script>"
response.end
    end if


if trim(request.form("blcjzl")="0") and trim(request.form("yzkzh"))<>"" then
response.write"<script>alert('�Բ�����û��ѡ�����ɼ������࣬��ȷ�����Ƿ񲹿���');history.back();</Script>"
response.end
end if
If len(trim(request.form("sfzh")))=15 then 
csrq="19"+mid(trim(request.form("sfzh")),7,6)
end if 
if len(trim(request.form("sfzh")))=18 then
csrq=mid(trim(request.form("sfzh")),7,8)
end if 
id=session("userid")
dim rname,sex,mz,csrq,blcjzl,jbyydm,sfzh,tel1,addr1,zy,whcd,yzkzh
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

set rs_q=Server.CreateObject("adodb.recordset")
sql_q ="select * from t_bm where sfzh='"&sfzh&"' and id<>'"&id&"'"
rs_q.open sql_q,conn,1,1
If not rs_q.eof then
response.write "<script>alert('�Բ����������֤�ű����Ѿ�¼����ˣ�����ϵ�������Ա��');history.back();</Script>"
response.end
End If

dim rs,sql
set rs=Server.CreateObject("Adodb.Recordset")
sql="select * from t_bm where id='"&id&"'"
rs.open sql,conn,1,3
bmh="410067"+jbyydm+id
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
rs.update
rs.close
set rs=nothing
rs_q.close
set rs_q=nothing
conn.close
set conn=nothing
response.write "<script>alert('��ϲ���������޸ĳɹ���');location.href='change_info.asp';</Script>"
%>


