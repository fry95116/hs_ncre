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
response.write("非法参数")
response.end
end if


set rs=Server.CreateObject("Adodb.Recordset")
sql="select * from t_bm where id='"&userid&"'"
rs.open sql,conn,1,1 
%>
<html>
<head>
<title>预报名信息浏览</title>
<meta http-equiv="content-type" content="text/html;charset=gb2312">
<meta http-equiv="Content-Language" content="zh-cn">
<meta name="Description" content="全国计算机等级考试,网上报名系统">
<meta name="Keywords" content="全国计算机等级考试,网上报名系统">
<meta http-equiv="Content-Type" content="text/html; charset=gb2312">
<link href="../mycss.css" rel="stylesheet" type="text/css">
</head>
<body bgColor=#F0F0F0>
<!--#include file="header.html"-->
<table width="778"><tr><td></td></tr></table>
    <TABLE borderColor=#ffffff cellSpacing=0 cellPadding=4 width="778" align=center border=1>
      <TBODY>
	  <tr><td colspan="4" bgColor=#f0f099>>>当前用户：<%=rs("xm")%>，报名号：<%=rs("bmh")%>。请注意等待学院通知进行交费和校对签字以便完成报名。</td></tr>
	    <TR>
          <TD bgColor=#f0f0f0>报考校区考点：
          <TD colspan="3" bgColor=#f0f0f0><span class="tdc">
<%if rs("xq")="1" then response.Write("1―花园校区") Else if rs("xq")="2" then response.Write("2―龙子湖校区") End if%></tr>
        <TR>
          <TD width="90" bgColor=#f0f0f0>报考级别语言：</span>
          <TD colspan="3" bgColor=#f0f0f0><span class="tdc">
         <%
set rsyy=Server.CreateObject("Adodb.Recordset")
sqlyy="select jbyy from Tc_JBYY where jbyydm='"&mid(rs("bmh"),7,2)&"'"
rsyy.open sqlyy,conn,1,1 
%>				
<%=mid(rs("bmh"),7,2)%>―<%=rsyy(0)%>
<%
rsyy.close
set rsyy=nothing
%>       
<TR>
          <TD bgcolor="#f0f0f0">  <p> 学号：</p>      
          <TD bgcolor="#f0f0f0"> <span class="tdc">   <%=rs("lxdz")%>  </span>  
          <TD bgcolor="#f0f0f0"> 姓名：       
          <TD bgcolor="#f0f0f0"><span class="tdc">  <%=rs("xm")%> </span></tr> 
        <TR bgcolor="#f0f0f0">
          <TD>民族： 
          <TD width="295"> <%
set rsmz=Server.CreateObject("Adodb.Recordset")
sqlmz="select mzmc from Tc_mz where mz='"&rs("mz")&"'"
rsmz.open sqlmz,conn,1,1 
%><span class="tdc">
<%=rs("mz")%>―<%=rsmz(0)%></span>
<%
rsmz.close
set rsmz=nothing
%>
          <TD width="72"> 性别：
          <TD width="263"><span class="tdc"> 
<%if rs("xb")="1" then response.Write("1―男") Else if rs("xb")="2" then response.Write("2―女") End if%></span>
        <TR>
          <TD bgColor=#f0f0f0>身份证号：        
          <TD bgColor=#f0f0f0> <p>            
            <span class="tdc"> <%=rs("sfzh")%>  </span>        
              </p>
          <TD bgColor=#f0f0f0>出生日期：
          <TD bgColor=#f0f0f0>
		  <p>
                <label>
               <span class="tdc"> <%=rs("csrq")%> </span>
                </label>
            </p>
        <TR>
            <TD bgColor=#f0f0f0>职业：
            <TD colspan="3" bgColor=#f0f0f0> <span class="tdc">

<%
set rszy=Server.CreateObject("Adodb.Recordset")
sqlzy="select zymc from Tc_zy where zy='"&rs("zy")&"'"
rszy.open sqlzy,conn,1,1 
%>	<span class="tdc">
<%=rs("zy")%>―<%=rszy(0)%> </span>
<%
rszy.close
set rszy=nothing
%>
</span>             
        <TR>
            <TD bgColor=#f0f0f0>文化程度：          
            <TD colspan="3" bgColor=#f0f0f0> 

        <%
set rswh=Server.CreateObject("Adodb.Recordset")
sqlwh="select whcdmc from Tc_whcd where whcd='"&rs("whcd")&"'"
rswh.open sqlwh,conn,1,1 
%>	<span class="tdc">
<%=rs("whcd")%>―<%=rswh(0)%></span>
<%
rswh.close
set rswh=nothing
%>             
          </span>                   
 <!--       <TR bgcolor="#f0f0f0">
          <TD>保留成绩种类：
          <TD> 

<%
set rsbl=Server.CreateObject("Adodb.Recordset")
sqlbl="select blcjmc from Tc_blcj where blcj='"&rs("blcjzl")&"'"
rsbl.open sqlbl,conn,1,1 
%><span class="tdc">
<%=rs("blcjzl")%>―<%=rsbl(0)%></span>
<%
rszy.close
set rszy=nothing
%>            
          <TD>上次准考证号：          
          <TD><p class="tdc"><%=rs("yzkzh")%></p>-->
        <TR>
           
            <TD bgColor=#f0f0f0>联系电话：
            <TD bgColor=#f0f0f0 colspan="3" > <span class="tdc"><%=rs("lxdh")%></span>
        <TR>
            <TD bgColor=#f0f0f0>          
            <TD colspan="3" bgColor=#f0f0f0>          
      </TBODY>
    </TABLE>
    <table border="0" cellpadding="3" width="782" >
              <tr> 
                <td width="100%" valign="top"bgColor=#f1daf0> 
                  <p align="center"><strong>【<a href="regchange.asp" class="1">修改信息</a>】</strong>
                  <strong>【<a href="logout.asp" class="1">退出登陆</a>】</strong>               </td>
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
