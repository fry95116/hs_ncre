<!--
/*
'' ============================================================================================
'' 项目名称：查询班级报名情况
'' 项目版本：V1.0
'' 项目描述：按班级查询报名情况
'' 文件名称：js/multi_select_option.js
'' 文件描述：多级联动下拉框Javascript脚本
'' 公司名称：教务处
'' 开发人员：李大侠
'' 创建日期：2010-12-4 16:44:24
'' 修订日期：2010-12-04 04:53:52
'' 版权信息：Copyright (C) 2010

'' 项目升级时需读取以下生成工具的版权信息
'' 生成工具：风越代码生成器 [FireCode Creator]
'' 当前版本：通用版 V3.5
'' 官方网站：http://www.sino8848.com
'' ============================================================================================
*/

var arrAllSelControlsName;
var arrAllListData;
var arrSelTitle;
var arrDefaultSelectValue;
var arrAllGetValueInputName;
var bAutoCreateNextLevel;

for (intNumNow = 0; intNumNow < intFuncNum; intNumNow++)
{
    try
    {
        eval("selFunc" + intNumNow + "();");
        eval("InitSelectSet(" + intNumNow + ");");
    }
    catch (e)
    {
        alert("指定函数未找到：selFunc" + intNumNow + "() 请修改 intFuncNum 数组的值，或增加相应函数。\r\n\r\n"+e.description);
    }
}

function InitVariables()
{
    arrAllSelControlsName = new Array();
    arrAllListData = new Array();
    arrSelTitle = new Array();
    arrDefaultSelectValue = new Array();
    arrAllGetValueInputName = new Array();
}

function InitSelectSet(iNum)
{

    FillType(arrAllSelControlsName[0]);

    for (i = 0; i < arrAllSelControlsName.length; i++)
    {
        eval("document.all." + arrAllSelControlsName[i] + ".attachEvent(\"onchange\", FillNextType);");
        if (intFuncNum > 1)
        {
            eval("document.all." + arrAllSelControlsName[i] + ".attachEvent(\"onclick\", selFunc" + iNum + ");");
        }
    }
}

function SetSelectTitle()
{
    var iTitle;
    for (iTitle = 0; iTitle < arrAllSelControlsName.length; iTitle++)
    {
        if (arrSelTitle.length > 0 && arrSelTitle[iTitle] != "")
        {
            eval("if (document.all." + arrAllSelControlsName[iTitle] + ".options.length == 0 || document.all." + arrAllSelControlsName[iTitle] + ".options(0).text != arrSelTitle[" + iTitle + "]) {document.all." + arrAllSelControlsName[iTitle] + ".options.add(new Option(arrSelTitle[" + iTitle + "], \"\"), 0);}");
        }
    }
}

function FillNextType()
{
    var strNowChoosedSelCtrlName = event.srcElement.name;
    if (strNowChoosedSelCtrlName == "")
    {
        strNowChoosedSelCtrlName = event.srcElement.id;
    }
    for (iCtrlNum = 0; iCtrlNum < arrAllSelControlsName.length; iCtrlNum++)
    {
        if (arrAllSelControlsName[iCtrlNum] == strNowChoosedSelCtrlName)
        {
            if (iCtrlNum < arrAllSelControlsName.length - 1)
            {
                FillType(arrAllSelControlsName[iCtrlNum + 1]);
            }

            if (arrAllGetValueInputName.length > 0)
            {
                eval("document.all." + arrAllGetValueInputName[iCtrlNum] + ".value = document.all." + arrAllSelControlsName[iCtrlNum] + ".options[document.all." + arrAllSelControlsName[iCtrlNum] + ".selectedIndex].value;");
            }
            break;
        }
    }
}

function FillType(strNowSelCtrlName)
{
    if (arrAllListData.length != arrAllSelControlsName.length || (arrAllGetValueInputName.length > 0 && arrAllSelControlsName.length != arrAllGetValueInputName.length))
    {
        alert("控件数目与数据（或接收文本框）数目不符，请检测程序设置！"+e.description);
        return;
    }
    
    var intNowSelCtrlIdx = 0;

    eval("var objNowSelCtrl = document.all." + strNowSelCtrlName + ";");

    var strParentSelCtrlName = "";
    for (i = 1; i < arrAllSelControlsName.length; i++)
    {
        if (strNowSelCtrlName == arrAllSelControlsName[i])
        {
            strParentSelCtrlName = arrAllSelControlsName[i - 1];
            intNowSelCtrlIdx = i;
        }
    }

    with (objNowSelCtrl)
    {
        if (intNowSelCtrlIdx == 0)
        {
            length = 0;

            for (i = 0; i < arrAllListData[intNowSelCtrlIdx].length; i++)
            {
                options[i] = new Option(arrAllListData[intNowSelCtrlIdx][i][1].toString(), arrAllListData[intNowSelCtrlIdx][i][2].toString());
                if (arrDefaultSelectValue.length > 0 && arrDefaultSelectValue[intNowSelCtrlIdx] != null && arrDefaultSelectValue[intNowSelCtrlIdx].toLowerCase() == arrAllListData[intNowSelCtrlIdx][i][2].toLowerCase())
                {
                    if (bAutoCreateNextLevel == false)
                    {
                        alert("如设置了下拉框控件的默认选项，则必须自动选择所有下拉框控件默认内容，请设置（bAutoCreateNextLevel = true）。否则应取消默认选项。"+e.description);
                        return;
                    }
                    selectedIndex = i;
                }
            }
        }
        else
        {
            eval("var objParentSelCtrl=document.all." + strParentSelCtrlName + ";");

            if (objParentSelCtrl.options.length > 0 && objParentSelCtrl.selectedIndex != -1)
            {
                var selTypeValue = objParentSelCtrl.options[objParentSelCtrl.selectedIndex].value;
                var selTypeID = 0;
                for (j = 0; j < arrAllListData[intNowSelCtrlIdx - 1].length; j++)
                {
                    if (selTypeValue.toString() == arrAllListData[intNowSelCtrlIdx - 1][j][2].toString())
                    {
                        selTypeID = arrAllListData[intNowSelCtrlIdx - 1][j][0];
                        break;
                    }
                }

                for (i = intNowSelCtrlIdx; i < arrAllSelControlsName.length; i++)
                {
                    eval("document.all." + arrAllSelControlsName[i] + ".length = 0;");
                }

                var s = 0; 
                for (i = 0; i < arrAllListData[intNowSelCtrlIdx].length; i++)
                {
                    if (arrAllListData[intNowSelCtrlIdx][i][3].toString() == selTypeID.toString())
                    {
                        options[s] = new Option(arrAllListData[intNowSelCtrlIdx][i][1].toString(), arrAllListData[intNowSelCtrlIdx][i][2].toString());
                        if (arrDefaultSelectValue[intNowSelCtrlIdx] != null && arrDefaultSelectValue[intNowSelCtrlIdx].toLowerCase() == arrAllListData[intNowSelCtrlIdx][i][2].toLowerCase())
                        {
                            selectedIndex = s;
                        }
                        s++;

                    }
                }
            }
        }

        SetSelectTitle();

        if (bAutoCreateNextLevel == true)
        {
            if (length > 0 && intNowSelCtrlIdx < arrAllSelControlsName.length - 1)
            {
                FillType(arrAllSelControlsName[intNowSelCtrlIdx + 1]);
            }
        }
        else
        {
            selectedIndex = 0;
        }


        if (arrAllGetValueInputName.length > 0)
        {
            if (arrAllGetValueInputName[intNowSelCtrlIdx] != "")
            {
                if (intNowSelCtrlIdx == 1)
                {
                    eval("document.all." + arrAllGetValueInputName[0] + ".value = document.all." + arrAllSelControlsName[0] + ".options[document.all." + arrAllSelControlsName[0] + ".selectedIndex].value;");
                }

                if (length > 0)
                {
                    eval("document.all." + arrAllGetValueInputName[intNowSelCtrlIdx] + ".value = document.all." + arrAllSelControlsName[intNowSelCtrlIdx] + ".options[document.all." + arrAllSelControlsName[intNowSelCtrlIdx] + ".selectedIndex].value;");
                }
                else
                {
                    for (i = intNowSelCtrlIdx; i < arrAllSelControlsName.length; i++)
                    {
                        eval("document.all." + arrAllGetValueInputName[i] + ".value = ''");
                    }
                }
            }
        }

    }
}
-->
