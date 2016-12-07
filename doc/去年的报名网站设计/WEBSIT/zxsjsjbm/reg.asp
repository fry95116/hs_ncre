<!--#include file="conn.asp"-->

<%
Response.Buffer = True 
'Response.ExpiresAbsolute = Now() - 1 
'Response.Expires = 0 
'Response.CacheControl = "no-cache" 
'If Session("FirstTimeToPage") = "YES"   Then
'response.write "<script>alert('请不要使用后退键，从首页登陆');history.back();</Script>"
'response.end
'End If
Session("FirstTimeToPage") = "NO" 
%> 
<% 
If  request.cookies("member")="" or session("userid")="" Then
Response.redirect"index.asp"
End If

dim userid
userid=session("userid")
if userid="''" or  Instr(userid,"'")>0  or   Instr(userid,"%")>0 then
response.write("非法参数")
response.end
end If

dim rscs,sqlcs
set rscs=Server.CreateObject("Adodb.Recordset")
sqlcs="select * from xjk where xh='"&userid&"'"
rscs.open sqlcs,conn,1,1
%>
<html>
<head>
<title>全国计算机等级考试网上报名系统</title>
<meta http-equiv="content-type" content="text/html;charset=gb2312">
<meta http-equiv="Content-Language" content="zh-cn">
<meta name="Description" content="全国计算机等级考试,网上报名系统">
<meta name="Keywords" content="全国计算机等级考试,网上报名系统">
<script language="JavaScript">
function zdsc()
{
var getsf=document.form1.sfzh.value;
if (getsf.length==15)
{
  document.form1.zdsccsrq.value="19"+getsf.substring(6,12);
  document.form1.zdsccsrq.focus()
  return false
  }
else if (getsf.length==18)
{
  document.form1.zdsccsrq.value=getsf.substring(6,14);
  document.form1.zdsccsrq.focus()
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
<form method="POST" name="form1" language="javascript" onSubmit="return Validator.Validate(this,2)" action="submit.asp" >

    <TABLE borderColor=#ffffff cellSpacing=0 cellPadding=4 width="778" align=center border=1>
      <TBODY>
	  <tr><td colspan="4""> 
	  </td></tr>
	    <TR>
          <TD bgColor=#f0f0f0>报考校区考点：
          <TD colspan="3" bgColor=#f0f0f0><span class="tdc">
<span class="style3">*</span>
 <!--<input name="xqkd" type="text" class="form" size="1" maxlength="1" value="<%=Trim(rscs("xq"))%>"   style="border:0;font-weight: bold;background:#f0f0f0;">
 <%if Trim(rscs("xq"))="1" then%>花园校区考点<%end if%> <%if Trim(rscs("xq"))="2" then%>龙子湖校区考点<%end if%>-->

<select size=1 name="xqkd" dataType="Require" msg="未选择校区考点">
 <option value="1" <%if Trim(rscs("xq"))="1" then%> selected  <%end if%>>1-花园校区考点</option>
 <option value="2" <%if Trim(rscs("xq"))="2" then%> selected  <%end if%>>2-龙子湖校区考点</option>
          </select>（请选择报考校区）
		  </tr>

 

        <TR>
          <TD width="90" bgColor=#f0f0f0>报考级别语言：</span>
          <TD colspan="3" bgColor=#f0f0f0><span class="tdc">
          <%dim rsr1,sqlr1
set rsr1=Server.CreateObject("Adodb.Recordset")
sqlr1="select * from tc_jbyy where kkbj=true"
rsr1.open sqlr1,conn,1,1
%><span class="style3">*</span>
          <select  size=1 name=jbyydm  dataType="Require"  msg="未选择报考级别语言" >
		  <option value=""  selected>选择报考级别语言</option>
		  <%do while not RSr1.eof %>				  
            <option value="<%=rsr1("jbyydm")%>"><%=rsr1("jbyydm")%>-<%=rsr1("jbyy")%></option>
			<%rsr1.movenext
loop
rsr1.close
set rsr1=nothing%>
          </select> 
          （建议报考二级C语言、三级网络技术） </span>
<TR>
          <TD bgcolor="#f0f0f0">  <p> 学号：</p>      
          <TD bgcolor="#f0f0f0">  <span class="style3">*</span>
                <input name="addr1" type="text" class="form" size="10" maxlength="10" value="<%=userid%>" dataType="LimitB" min="9" max="10"  msg="学号应为9位，如果错误请联系考点" readonly="true"> （不可改，来自学籍库）    
          <TD bgcolor="#f0f0f0"> <span class="tdc">姓名</span>：       
          <TD bgcolor="#f0f0f0"><span class="style3">*</span>
              <input type="text" name="rname" size="13" maxlength="13"  value="<%=Trim(rscs("xm"))%>" class="form" dataType="Chinese" msg="姓名只允许中文">（来自学籍库）</tr> 
        <TR bgcolor="#f0f0f0">
          <TD>民族： 
          <TD width="295"> <%dim rsr0,sqlr0
set rsr0=Server.CreateObject("Adodb.Recordset")
sqlr0="select * from tc_mz"
rsr0.open sqlr0,conn,1,1
%><span class="style3">*</span>
            <select   size=1 name=mz   dataType="Require"  msg="未选择民族" >
		<!--  <option value="" selected>选择您的民族</option>-->
				   <%do while not RSr0.eof %>
               <option value="<%=rsr0("mz")%>" <%if rsr0("mz")="01" then%> selected <%end if%>><%=rsr0("mz")%>-<%=rsr0("mzmc")%></option>
		  	   <%rsr0.movenext
loop
rsr0.close
set rsr0=nothing%> </select>
          <TD width="72"> <span class="tdc">性别</span>：
          <TD width="263"> <span class="style3">*</span>  
<select size=1 name="sex" dataType="Require" msg="未选择性别">
         <!--     <option value="" selected>选择性别</option>
            <option value="1">1-男</option>
            <option value="2">2-女</option>-->
 <option value="1" <%if Trim(rscs("xb"))="1" then%> selected  <%end if%>>1-男</option>
 <option value="2" <%if Trim(rscs("xb"))="2" then%> selected  <%end if%>>2-女</option>
          </select>		      	 
        <TR>
          <TD bgColor=#f0f0f0>身份证号：        
          <TD bgColor=#f0f0f0> <p><span class="style3">*</span>            
              <input name="sfzh" type="text" class="form"  size="19" maxlength="18"  value="<%=rscs("sfzh")%>" dataType="IdCard" msg="身份证号错误">
              <span class="tdc">（如有X,须大写）</span>            
              </p>
          <TD bgColor=#f0f0f0>出生日期：
          <TD bgColor=#f0f0f0><label></label>                   
              <p>
                <label>
                <span class="style3">*</span>
                <input name="zdsccsrq" type="text" size="9" maxlength="8" readonly="true"  onFocus="zdsc()">
                </label> （点击从身份证生成）</p>
        <TR>
            <TD bgColor=#f0f0f0>职业：
            <TD colspan="3" bgColor=#f0f0f0> <span class="tdc">
<%dim rsr3,sqlr3
set rsr3=Server.CreateObject("Adodb.Recordset")
sqlr3="select * from tc_zy"
rsr3.open sqlr3,conn,1,1
%><span class="style3">*</span>
<SELECT class=form id=zy size=1 name=zy >
<%do while not RSr3.eof %>
<option value="<%=rsr3("zy")%>" <%if rsr3("zy")="30" then%> selected <%end if%>><%=rsr3("zy")%>-<%=rsr3("zymc")%></option>
<%rsr3.movenext
loop
rsr3.close
set rsr3=nothing%></SELECT> 
</span>             
        <TR>
            <TD bgColor=#f0f0f0>文化程度：          
            <TD colspan="3" bgColor=#f0f0f0> 
<%dim rsr2,sqlr2
set rsr2=Server.CreateObject("Adodb.Recordset")
sqlr2="select * from tc_whcd"
rsr2.open sqlr2,conn,1,1
%><span class="style3">*</span>
          <SELECT class=form id=select size=1 name=whcd>
<%do while not RSr2.eof %>
<option value="<%=rsr2("whcd")%>" <%if rsr2("whcd")="3" then%> selected <%end if%>><%=rsr2("whcd")%>-<%=rsr2("whcdmc")%></option>
<%rsr2.movenext
loop
rsr2.close
set rsr2=nothing%></SELECT>
          </span>                   
       
        <TR>
           
            <TD bgColor=#f0f0f0>联系电话：
            <TD bgColor=#f0f0f0 colspan="3" ><span class="style3">*</span>   <input name="tell" type="text"  size="20" maxlength="11" class="form"  style="ime-mode: disabled;" datatype="Mobile" msg="请填写个人手机或者班长手机"> （请填写自己手机号码或班长手机号码）
        <TR>
          <TD colspan="4" bgColor=#f0f0f0 align="center"><font color=red><input  type="checkbox" name="sfcx" value="是" dataType="Group" min="1" max="1"  msg="签署考试诚信承诺书方可进行报名,请勾选复选框">我同意签署<a href="../cxcns.htm" target="_blank"><u>《全国计算机等级考试诚信承诺书》</u></a></font> 
		<TR>
            <TD bgColor=#f0f0f0>          
            <TD colspan="3" bgColor=#f0f0f0>          
      </TBODY>
    </TABLE>
	<p>
      <input type="submit" value="提交信息" name="B3" class="form">
&nbsp;
<input type="reset" value="重新来过" name="B3" class="form">
<input name="myzdy" type="hidden" value="<%=Trim(rscs("yx"))%>-<%=Trim(rscs("bj"))%>-<%=Trim(rscs("xh"))%>"  readonly="true">
     </p>
  </form>  
  <%
rscs.close
set rscs=nothing
conn.close
set conn=nothing
%>
<!--#include file="footer.html"--> 
</body>  
  
</html>  
