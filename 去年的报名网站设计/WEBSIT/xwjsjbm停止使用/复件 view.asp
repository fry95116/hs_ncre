<!--#include file="conn.asp"-->
<html>
<head>
<title>Ԥ������Ϣ���</title>
<meta http-equiv="Content-Language" content="zh-cn">
<meta http-equiv="Content-Type" content="text/html; charset=gb2312">
<meta name="Description" content="���ϱ���">
<meta name="Keywords" content="���ϱ���">
<meta name="GENERATOR" content="Microsoft FrontPage 4.0">
<meta name="ProgId" content="FrontPage.Editor.Document">
<script language="javascript">
<!--
if (parent.frames.length > 0) {
parent.location.href = location.href;
}
function help(){
window.open("help.htm","","width=960,height=480,top=30,left=10,resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no");
}
// --></script>
<link href="mycss.css" rel="stylesheet" type="text/css">
</head>

<body bgcolor="#ffdd6d" topmargin="2" leftmargin="0">
<!--#include file="header.html"-->
<div align="center" >
<%
set rs=Server.CreateObject("Adodb.Recordset")
sql="select * from t_bm where id='"&userid&"'"
rs.open sql,conn,1,1 
%>

    <table width="778" border="0" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF" >
<tr><td colspan="2" bgcolor="#ffdd6d"></td>
</tr>
<tr> <td width="151" height="360" valign="top">
<table width="151" height="436" border="0" align="left" cellpadding="0" cellspacing="0" bgcolor="#FFA800">
    
      <center>
        <tr> 
          <td width="151" height="55" valign="middle"> 
            <p align="center"><img src="images/home.gif" width="27" height="25" usemap="#Map" border="0">
              <map name="Map">
                <area shape="rect" coords="2,1,47,33" href="logout.asp">
              </map>
            </td>
        </tr>
        <tr>
          <td width="151" height="9" bgcolor="#FFCD71">��ǰ�û���<%=rs("xm")%><br>
�����ţ�<%=rs("bmh")%> </td>
        </tr>
        <tr> 
          <td width="151" height="17">��</td>
        </tr>
      </center>
      <tr> 
        <td width="151" height="255" valign="top"> 
          <div align="center"> 
            <table border="0" cellpadding="3" width="100%" height="157">
              <tr> 
                <td width="100%" valign="top"> 
                  <p align="center"><strong>��<a href="change_info.asp" class="1">�޸���Ϣ</a>��</strong>
                    <p align="center">
                  <strong> ��<a href="javascript:help()" class="1">������Ϣ</a>��</strong><p align="center">
                    <strong>��<a href="logout.asp" class="1">�˳���½</a>��</strong>               </td>
              </tr>
            </table>
        </div>        </td>
      </tr>
</table>
</td>
        <td width="627" valign="top" bgcolor="#F0F0F0"> 
<div align="center">
<center>
<p style="font-size:10pt">  ���ı�����Ϊ:<b><%=rs("bmh")%></b><br>
����Ϊ�������ϱ�����Ϣ,����ָ��ʱ�䵽ָ���ص㽻�Ѻ�У����Ϣ�Ա���ɱ���.
</p>
<table width="400" height="176" border="1" align="center" cellspacing="0">
              <tr>
                
                <td width="128" height="29" bgcolor="#F0F0F0" class="atd"><p align="left">�� ����                </td>
              <td width="256" class="atd"><%=rs("xm")%>              </tr>
              <tr>
              
                <td height="28" bgcolor="#F0F0F0"><p align="left" class="atd">�� ��                </td>
              <td class="atd"><%if rs("xb")="1" then response.Write("1�D��") else if rs("xb")="2" then response.Write("2�DŮ") End if%>              </tr>
              <tr>
             
                <td height="24" bgcolor="#F0F0F0"><p align="left" class="atd"><span class="tdc">�� ��</span>��                </td>
                <td class="atd"> <%
set rsmz=Server.CreateObject("Adodb.Recordset")
sqlmz="select mzmc from Tc_mz where mz='"&rs("mz")&"'"
rsmz.open sqlmz,conn,1,1 
%>
<%=rs("mz")%>�D<%=rsmz(0)%>
      <%
rsmz.close
set rsmz=nothing
%></td>
              </tr>
              <tr>
               
                <td height="6" bgcolor="#F0F0F0" class="atd"><p align="left">���֤�ţ�</td>
                <td height="6" class="atd"><%=rs("sfzh")%></td>
              </tr>
              <tr>
               
                <td height="24" bgcolor="#F0F0F0" class="atd"><p align="left">�������ڣ�</td>
              <td class="atd"><%=rs("csrq")%>              </tr>
			   <tr>
               
                <td height="24" bgcolor="#F0F0F0" class="atd"><p align="left">����У����</td>
              <td class="atd"><%If rs("xq")="1" Then response.Write("1�D��԰У��") Else If rs("xq")="2" Then response.Write("2�D���Ӻ�У��") End if%>              </tr>
              <tr>
              
                <td height="24" bgcolor="#F0F0F0" class="atd"><p align="left"><span class="tdc">������������</span>��                </td>
                <td class="atd">
				<%
set rsyy=Server.CreateObject("Adodb.Recordset")
sqlyy="select jbyy from Tc_JBYY where jbyydm='"&mid(rs("bmh"),7,2)&"'"
rsyy.open sqlyy,conn,1,1 
%>				<%=mid(rs("bmh"),7,2)%>�D<%=rsyy(0)%>
<%
rsyy.close
set rsyy=nothing
%>              </tr>
              <tr>
               
                <td height="9" bgcolor="#F0F0F0" class="atd"><p align="left"><span class="tdc">�Ļ��̶�</span>��                </td>
                <td class="atd"> 
				<%
set rswh=Server.CreateObject("Adodb.Recordset")
sqlwh="select whcdmc from Tc_whcd where whcd='"&rs("whcd")&"'"
rswh.open sqlwh,conn,1,1 
%>	
<%=rs("whcd")%>�D<%=rswh(0)%>
<%
rswh.close
set rswh=nothing
%>              </tr>
              <tr>
               
                <td height="6" bgcolor="#F0F0F0" class="atd"><p align="left"><span class="tdc">ְ ҵ</span>�� </td>
                <td height="6" class="atd"><%
set rszy=Server.CreateObject("Adodb.Recordset")
sqlzy="select zymc from Tc_zy where zy='"&rs("zy")&"'"
rszy.open sqlzy,conn,1,1 
%>	
<%=rs("zy")%>�D<%=rszy(0)%>
<%
rszy.close
set rszy=nothing
%></td>
              </tr>
              <tr>
             
                <td height="6" bgcolor="#F0F0F0" class="atd"><p align="left">��ϵ�绰��                </td>
                <td height="6" class="atd"><%=rs("lxdh")%>&nbsp;</td>
              </tr>
              <tr>
              
                <td height="6" bgcolor="#F0F0F0" class="atd"><p align="left">ѧ�Ż���ϵ��ַ��                </td>
                <td height="6" class="atd"><%=rs("lxdz")%></td>
              </tr>
             
              <tr>
             
                <td height="6" bgcolor="#F0F0F0" class="atd"><p align="left"><span class="tdc">�Ƿ񲹿�</span>�� </td>
                <td height="6" class="atd"><%
set rsbl=Server.CreateObject("Adodb.Recordset")
sqlbl="select blcjmc from Tc_blcj where blcj='"&rs("blcjzl")&"'"
rsbl.open sqlbl,conn,1,1 
%>
                    <%=rs("blcjzl")%>�D<%=rsbl(0)%>
                <%
rszy.close
set rszy=nothing
%></td>
              </tr>
              <tr>
           
                <td height="6" bgcolor="#F0F0F0" class="atd"><p align="left"><span class="tdc">ԭ׼��֤��</span>�� </td>
                <td height="6" class="atd"><%=rs("yzkzh")%>&nbsp;</td>
              </tr>
            </table>
</center>
</div></td>
</tr>
</table>
<%
rs.close
set rs=nothing
conn.close
set conn=nothing
%>
</div>
<!--#include file="footer.html"-->
</body>

</html>
