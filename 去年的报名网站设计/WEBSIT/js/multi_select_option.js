<!--
/*
'' ============================================================================================
'' ��Ŀ���ƣ���ѯ�༶�������
'' ��Ŀ�汾��V1.0
'' ��Ŀ���������༶��ѯ�������
'' �ļ����ƣ�js/multi_select_option.js
'' �ļ��������༶����������Javascript�ű�
'' ��˾���ƣ�����
'' ������Ա�������
'' �������ڣ�2010-12-4 16:44:24
'' �޶����ڣ�2010-12-04 04:53:52
'' ��Ȩ��Ϣ��Copyright (C) 2010

'' ��Ŀ����ʱ���ȡ�������ɹ��ߵİ�Ȩ��Ϣ
'' ���ɹ��ߣ���Խ���������� [FireCode Creator]
'' ��ǰ�汾��ͨ�ð� V3.5
'' �ٷ���վ��http://www.sino8848.com
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
        alert("ָ������δ�ҵ���selFunc" + intNumNow + "() ���޸� intFuncNum �����ֵ����������Ӧ������\r\n\r\n"+e.description);
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
        alert("�ؼ���Ŀ�����ݣ�������ı�����Ŀ����������������ã�"+e.description);
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
                        alert("��������������ؼ���Ĭ��ѡ�������Զ�ѡ������������ؼ�Ĭ�����ݣ������ã�bAutoCreateNextLevel = true��������Ӧȡ��Ĭ��ѡ�"+e.description);
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
