<!--#include file="conn.asp"-->

<%
Response.Buffer = True 
Response.ExpiresAbsolute = Now() - 1 
Response.Expires = 0 
Response.CacheControl = "no-cache" 
Session("FirstTimeToPage") = "NO" 

If  request.cookies("member")="" or session("userid")="" Then
Response.redirect"index.asp"
End If

dim userid
userid=session("userid")
if userid="''" or  Instr(userid,"'")>0  or   Instr(userid,"%")>0 then
response.write("�Ƿ�����")
response.end
end if

dim rs,sql
set rs=Server.CreateObject("Adodb.Recordset")
sql="select * from t_bm where id='"&userid&"'"
rs.open sql,conn,1,1
%>
<html>
<head>
<title>�޸ı�������</title>
<meta http-equiv="content-type" content="text/html;charset=gb2312">
<meta http-equiv="Content-Language" content="zh-cn">
<meta name="Description" content="ȫ��������ȼ�����,���ϱ���ϵͳ">
<meta name="Keywords" content="ȫ��������ȼ�����,���ϱ���ϵͳ">
<script language="JavaScript">
function zdsc()
{
var getsf=document.form2.sfzh.value;
if (getsf.length==15)
{
  document.form2.zdsccsrq.value="19"+getsf.substring(6,12);
  document.form2.zdsccsrq.focus()
  return false
  }
else if (getsf.length==18)
{
  document.form2.zdsccsrq.value=getsf.substring(6,14);
  document.form2.zdsccsrq.focus()
  return false
  }
}
</script>
<script language="javascript" src="checkdata.js" type="text/javascript"></script>
<meta http-equiv="Content-Type" content="text/html; charset=gb2312">
<link href="../mycss.css" rel="stylesheet" type="text/css">
</head>
<body bgColor=#F0F0F0>
<!--#include file="header.html"-->
<table width="778" align=center><tr><td>
<form name="form2" method="POST"  onSubmit="return Validator.Validate(this,2)"  action="change_info_save.asp">

    <TABLE borderColor=#ffffff cellSpacing=0 cellPadding=4 width="778" align=center border=1>
      <TBODY><tr><td colspan="4"  bgColor=#f0f099>>>��ǰ�û���<%=rs("xm")%>�������ţ�<%=rs("bmh")%>��<br>��*��Ϊ���������ǲ����������ȷѡ�����ɼ������࣬����ȷ��д�ϴ�׼��֤�ţ������Ҫ������޸ģ��޸ĺ���鿴ȷ�ϱ�����Ϣ��</td></tr>
	    <TR>
          <TD bgColor=#f0f0f0>����У�����㣺
          <TD colspan="3" bgColor=#f0f0f0>
<span class="style3">*</span>
<input name="xqkd" type="text" class="form" size="1" maxlength="1" value="<%=Trim(rs("xq"))%>"  readonly="true" style="border:0;font-weight: bold;background:#f0f0f0;">
 <%if Trim(rs("xq"))="1" then%>��԰У������<%end if%> <%if Trim(rs("xq"))="2" then%>���Ӻ�У������<%end if%>
<!--<select size=1  name="xqkd" class=form dataType="Require" msg="δѡ��У������">
             <option value="1" <%if rs("xq")="1" then%> selected  <%end if%>>1-��԰У��</option>
            <option value="2" <%if rs("xq")="2" then%> selected  <%end if%>>2-���Ӻ�У��</option>
             </select> ��ѡ����У�����������Ե���������У����-->
			 
			 </tr>
        <TR>
          <TD width="90" bgColor=#f0f0f0>�����������ԣ�
          <TD colspan="3" bgColor=#f0f0f0>
         <%dim rs1,sql1
set rs1=Server.CreateObject("Adodb.Recordset")
sql1="select * from tc_jbyy where kkbj=true"
rs1.open sql1,conn,1,1
%><span class="style3">*</span>
          <select  size=1 name=jbyydm class=form dataType="Require"  msg="δѡ�񱨿���������" >
		 <%do while not RS1.eof %>
        <option value="<%=rs1("jbyydm")%>" <%if rs1("jbyydm")=mid(rs("bmh"),7,2) then%> selected <%end if%>><%=rs1("jbyydm")%>-<%=rs1("jbyy")%></option>
<%rs1.movenext
loop
rs1.close
set rs1=nothing%>
          </select> �����鱨������C���ԡ��������缼���� </tr>
<TR>
          <TD bgcolor="#f0f0f0">  <p> ѧ�ţ�</p>      
          <TD bgcolor="#f0f0f0">  <span class="style3">*</span>
<input name="addr1" type="text" class="form" size="10" maxlength="10" value="<%=rs("lxdz")%>" dataType="LimitB" min="9" max="10"  msg="ѧ��ӦΪ9λ�������������ϵ����" readonly="true">�����ɸģ�����ѧ���⣩    
          <TD bgcolor="#f0f0f0"> ������       
          <TD bgcolor="#f0f0f0"><span class="style3">*</span>
              <input type="text" name="rname" size="12" maxlength="12"  value="<%=rs("xm")%>" class="form" dataType="Chinese" msg="����ֻ��������"> ������ѧ���⣩</tr> 
        <TR bgcolor="#f0f0f0">
          <TD>���壺 
          <TD width="295"><%dim rs0,sql0
set rs0=Server.CreateObject("Adodb.Recordset")
sql0="select * from tc_mz"
rs0.open sql0,conn,1,1
%><span class="style3">*</span>
            <select  class=form size=1 name=mz   dataType="Require"  msg="δѡ������" >
		<%do while not RS0.eof %>
        <option value="<%=rs0("mz")%>" <%if rs0("mz")=rs("mz") then%> selected <%end if%>><%=rs0("mzmc")%></option>
<%rs0.movenext
loop
rs0.close
set rs0=nothing%> </select>
          <TD width="72"> �Ա�
          <TD width="263"> <span class="style3">*</span>  
<select size=1 name="sex" dataType="Require" msg="δѡ���Ա�">
            <option value="1" <%if rs("xb")="1" then%> selected  <%end if%>>1-��</option>
            <option value="2" <%if rs("xb")="2" then%> selected  <%end if%>>2-Ů</option>
          </select>		      	 
        <TR>
          <TD bgColor=#f0f0f0>���֤�ţ�        
          <TD bgColor=#f0f0f0> <p><span class="style3">*</span>            
              <input name="sfzh" type="text" class="form" size="20" maxlength="18"  value="<%=rs("sfzh")%>" dataType="IdCard" msg="���֤�Ŵ���">
              <span class="tdc">������X,���д��</span>            
              </p>
          <TD bgColor=#f0f0f0>�������ڣ�
          <TD bgColor=#f0f0f0><label></label>                   
              <p>
                <label>
                <span class="style3">*</span>
                <input name="zdsccsrq" type="text" size="9" maxlength="8" value="<%=rs("csrq")%>" readonly="true"  onFocus="zdsc()">
                </label>
            ����������֤���ɣ�</p>
        <TR>
            <TD bgColor=#f0f0f0>ְҵ��
            <TD colspan="3" bgColor=#f0f0f0> <span class="tdc">
<%dim rs3,sql3
set rs3=Server.CreateObject("Adodb.Recordset")
sql3="select * from tc_zy"
rs3.open sql3,conn,1,1
%><span class="style3">*</span>
<SELECT  size=1 name=zy>
<%do while not RS3.eof %>
        <option value="<%=rs3("zy")%>" <%if rs3("zy")=rs("zy") then%> selected <%end if%>><%=rs3("zymc")%></option>
<%rs3.movenext
loop
rs3.close
set rs3=nothing%></SELECT>
</span>             
        <TR>
            <TD bgColor=#f0f0f0>�Ļ��̶ȣ�          
            <TD colspan="3" bgColor=#f0f0f0> 
<%dim rs2,sql2
set rs2=Server.CreateObject("Adodb.Recordset")
sql2="select * from tc_whcd"
rs2.open sql2,conn,1,1
%><span class="style3">*</span>
<SELECT  size=1 name="whcd">
<%do while not RS2.eof %>
        <option value="<%=rs2("whcd")%>" <%if rs2("whcd")=rs("whcd") then%> selected <%end if%>><%=rs2("whcdmc")%></option>
<%rs2.movenext
loop
rs2.close
set rs2=nothing%></SELECT>
          </span>                   
<!--        <TR bgcolor="#f0f0f0">
          <TD>�Ƿ񲹿���
          <TD> <span class="tdc">
<%dim rs4,sql4
set rs4=Server.CreateObject("Adodb.Recordset")
sql4="select * from tc_blcj"
rs4.open sql4,conn,1,1
%><span class="style3">*</span>
<select name="blcjzl" size=1 >
<%do while not RS4.eof %>
        <option value="<%=rs4("blcj")%>" <%if rs4("blcj")=rs("blcjzl") then%> selected <%end if%>><%=rs4("blcjmc")%></option>
<%rs4.movenext
loop
rs4.close
set rs4=nothing%></select>��Ĭ��Ϊ��������������ѡ������Ŀ��</span>             
          <TD>�ϴ�׼��֤�ţ�          
          <TD><p class="tdc">
              <input name="yzkzh" type="text"  size="18" maxlength="20" value="<%=rs("yzkzh")%>"  style="ime-mode: disabled;">����������<span class="STYLE6">��</span>��д��</p>--> 
        <TR>
           
            <TD bgColor=#f0f0f0>��ϵ�绰��
            <TD bgColor=#f0f0f0 colspan="3" ><span class="style3">*</span>  
			<input name="tell" type="text"  size="20" maxlength="11" value="<%=rs("lxdh")%>" style="ime-mode: disabled;" datatype="Mobile" msg="����д�����ֻ���ϵ��ʽ���߰೤�ֻ�"> ������д�Լ��ֻ������೤�ֻ����룩 
        <TR>
            <TD bgColor=#f0f0f0>          
            <TD colspan="3" bgColor=#f0f0f0>          
      </TBODY>
    </TABLE>
    <p align=center>
      <input type="submit" value="�ύ��Ϣ" name="B3" >
&nbsp;
<input type="reset" value="��������" name="B3" class="form">&nbsp;
��<a href="regview.asp" class="1">�鿴��Ϣ</a>��
��<a href="logout.asp" class="1">�˳���½</a>��
     </p>
  </form> </td></tr></table> 
  <%
rs.close
set rs=nothing
conn.close
set conn=nothing
%>
<!--#include file="footer.html"--> 
</body>  
  
</html>  
