<!--#include file="conn.asp"-->
<%
Response.Buffer = True 
Response.ExpiresAbsolute = Now() - 1 
Response.Expires = 0 
Response.CacheControl = "no-cache" 
Session("FirstTimeToPage") = "YES" 

If request.cookies("member")="" or session("userid")="" Then
Response.redirect"index.asp"
End If

dim userid
userid=session("userid")
if userid="''" or  Instr(userid,"'")>0  or   Instr(userid,"%")>0 then
response.write("�Ƿ�����")
response.end
end if


set rs=Server.CreateObject("Adodb.Recordset")
sql="select * from t_bm where id='"&userid&"'"
rs.open sql,conn,1,1 
%>
<html>
<head>
<title>Ԥ������Ϣ���</title>
<meta http-equiv="content-type" content="text/html;charset=gb2312">
<meta http-equiv="Content-Language" content="zh-cn">
<meta name="Description" content="ȫ��������ȼ�����,���ϱ���ϵͳ">
<meta name="Keywords" content="ȫ��������ȼ�����,���ϱ���ϵͳ">
<meta http-equiv="Content-Type" content="text/html; charset=gb2312">
<link href="../mycss.css" rel="stylesheet" type="text/css">
</head>
<body bgColor=#F0F0F0>
<!--#include file="header.html"-->
<table width="778"><tr><td></td></tr></table>
    <TABLE borderColor=#ffffff cellSpacing=0 cellPadding=4 width="778" align=center border=1>
      <TBODY>
	  <tr><td colspan="4" bgColor=#f0f099>>>��ǰ�û���<%=rs("xm")%>�������ţ�<%=rs("bmh")%>����ע��ȴ�ѧԺ֪ͨ���н��Ѻ�У��ǩ���Ա���ɱ�����</td></tr>
	    <TR>
          <TD bgColor=#f0f0f0>����У�����㣺
          <TD colspan="3" bgColor=#f0f0f0><span class="tdc">
<%if rs("xq")="1" then response.Write("1�D��԰У��") Else if rs("xq")="2" then response.Write("2�D���Ӻ�У��") End if%></tr>
        <TR>
          <TD width="90" bgColor=#f0f0f0>�����������ԣ�</span>
          <TD colspan="3" bgColor=#f0f0f0><span class="tdc">
         <%
set rsyy=Server.CreateObject("Adodb.Recordset")
sqlyy="select jbyy from Tc_JBYY where jbyydm='"&mid(rs("bmh"),7,2)&"'"
rsyy.open sqlyy,conn,1,1 
%>				
<%=mid(rs("bmh"),7,2)%>�D<%=rsyy(0)%>
<%
rsyy.close
set rsyy=nothing
%>       
<TR>
          <TD bgcolor="#f0f0f0">  <p> ѧ�ţ�</p>      
          <TD bgcolor="#f0f0f0"> <span class="tdc">   <%=rs("lxdz")%>  </span>  
          <TD bgcolor="#f0f0f0"> ������       
          <TD bgcolor="#f0f0f0"><span class="tdc">  <%=rs("xm")%> </span></tr> 
        <TR bgcolor="#f0f0f0">
          <TD>���壺 
          <TD width="295"> <%
set rsmz=Server.CreateObject("Adodb.Recordset")
sqlmz="select mzmc from Tc_mz where mz='"&rs("mz")&"'"
rsmz.open sqlmz,conn,1,1 
%><span class="tdc">
<%=rs("mz")%>�D<%=rsmz(0)%></span>
<%
rsmz.close
set rsmz=nothing
%>
          <TD width="72"> �Ա�
          <TD width="263"><span class="tdc"> 
<%if rs("xb")="1" then response.Write("1�D��") Else if rs("xb")="2" then response.Write("2�DŮ") End if%></span>
        <TR>
          <TD bgColor=#f0f0f0>���֤�ţ�        
          <TD bgColor=#f0f0f0> <p>            
            <span class="tdc"> <%=rs("sfzh")%>  </span>        
              </p>
          <TD bgColor=#f0f0f0>�������ڣ�
          <TD bgColor=#f0f0f0>
		  <p>
                <label>
               <span class="tdc"> <%=rs("csrq")%> </span>
                </label>
            </p>
        <TR>
            <TD bgColor=#f0f0f0>ְҵ��
            <TD colspan="3" bgColor=#f0f0f0> <span class="tdc">

<%
set rszy=Server.CreateObject("Adodb.Recordset")
sqlzy="select zymc from Tc_zy where zy='"&rs("zy")&"'"
rszy.open sqlzy,conn,1,1 
%>	<span class="tdc">
<%=rs("zy")%>�D<%=rszy(0)%> </span>
<%
rszy.close
set rszy=nothing
%>
</span>             
        <TR>
            <TD bgColor=#f0f0f0>�Ļ��̶ȣ�          
            <TD colspan="3" bgColor=#f0f0f0> 

        <%
set rswh=Server.CreateObject("Adodb.Recordset")
sqlwh="select whcdmc from Tc_whcd where whcd='"&rs("whcd")&"'"
rswh.open sqlwh,conn,1,1 
%>	<span class="tdc">
<%=rs("whcd")%>�D<%=rswh(0)%></span>
<%
rswh.close
set rswh=nothing
%>             
          </span>                   
 <!--       <TR bgcolor="#f0f0f0">
          <TD>�����ɼ����ࣺ
          <TD> 

<%
set rsbl=Server.CreateObject("Adodb.Recordset")
sqlbl="select blcjmc from Tc_blcj where blcj='"&rs("blcjzl")&"'"
rsbl.open sqlbl,conn,1,1 
%><span class="tdc">
<%=rs("blcjzl")%>�D<%=rsbl(0)%></span>
<%
rszy.close
set rszy=nothing
%>            
          <TD>�ϴ�׼��֤�ţ�          
          <TD><p class="tdc"><%=rs("yzkzh")%></p>-->
        <TR>
           
            <TD bgColor=#f0f0f0>��ϵ�绰��
            <TD bgColor=#f0f0f0 colspan="3" > <span class="tdc"><%=rs("lxdh")%></span>
        <TR>
            <TD bgColor=#f0f0f0>          
            <TD colspan="3" bgColor=#f0f0f0>          
      </TBODY>
    </TABLE>
    <table border="0" cellpadding="3" width="782" >
              <tr> 
                <td width="100%" valign="top"bgColor=#f1daf0> 
                  <p align="center"><strong>��<a href="regchange.asp" class="1">�޸���Ϣ</a>��</strong>
                  <strong>��<a href="logout.asp" class="1">�˳���½</a>��</strong>               </td>
              </tr>
            </table>
  <%
rs.close
set rs=nothing
conn.close
set conn=nothing
%>
<!--#include file="footer.html"--> 
</body>  
  
</html>  
