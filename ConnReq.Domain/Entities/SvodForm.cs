using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConnReq.Domain.Entities
{
    public enum CellType { Empty = 0, Number, Text, Date, DateTime, Integer, IntRange, Boolean, CLob, BLob, SelectList, Button, Tree }
    public enum CellMode { Disable = 0, Input, Calculate, History, InputRO, HistoryRO, Header, Error }
    public class FormCell
    {
        public int Row { get; set; }
        public int Column { get; set; }
        public string? Value { get; set; }
        public CellType Type { get; set; }
        public CellMode Mode { get; set; }
        public string? Tooltip { get; set; }
        public FormCell(int r, int c, string v, CellType t = CellType.Text, CellMode mode = CellMode.Disable)
        {
            Row = r; Column = c; Value = v; Type = t; Mode = mode;
        }
        public FormCell() { Empty(); }
        public FormCell(FormCell cell) : this() { Copy(cell); }
        public void Empty()
        {
            Row = 0;
            Column = 0;
            Value = null;
            Type = CellType.Empty;
            Mode = CellMode.Disable;
            Tooltip = null;
        }
        public void Copy(FormCell cell)
        {
            Row = cell.Row;
            Column = cell.Column;
            Value = cell.Value;
            Type = cell.Type;
            Mode = cell.Mode;
            Tooltip = cell.Tooltip;
        }
        public override string ToString() { return string.Format("Row={0} Column={1} Value={2} Type={3} Mode={4}", Row, Column, Value, Type, Mode); }
    }
    public class HeaderCell : FormCell
    {
        public HeaderCell(int r, int c, string v) : base(r, c, v) { ShowVertical = false; ColSpan = RowSpan = 1; Type = CellType.Text; Mode = CellMode.Header; }
        public bool ShowVertical { get; set; }
        public int ColSpan { get; set; }
        public int RowSpan { get; set; }
    }
    public class RangeFormCell : FormCell
    {
        public int Min { get; set; }
        public int Max { get; set; }
        public RangeFormCell(int r, int c, string v)
            : base(r, c, v, CellType.IntRange)
        {
        }
    }
    /// <summary>
    /// Параметр Value соответствует ключу выбранного элемента
    /// </summary>
    public class SelectFormCell : FormCell
    {
        public Dictionary<string, string> options { get; set; }
        public SelectFormCell(int r, int c, string v, Dictionary<string, string> list, CellMode mode)
            : base(r, c, v, CellType.SelectList, mode)
        {
            options = list;
        }
    }
    public class ButtonFormCell : FormCell
    {
        private string href;    // id формы в виде строки
        public string Url { get { return href; } }
        public ButtonFormCell(int r, int c, string t, string url) : base(r, c, t, CellType.Button)
        {
            href = url;
        }
        public ButtonFormCell(FormCell cell, string url) : base(cell)
        {
            Type = CellType.Button;
            href = url;
        }
    }
    public class BoolFormCell : FormCell
    {
        public bool BoolValue { get; set; }
        public BoolFormCell(int r, int c, string t, bool v) : base(r, c, t, CellType.Boolean)
        {
            BoolValue = v;
        }
        public BoolFormCell(FormCell cell, bool value) : base(cell)
        {
            Type = CellType.Boolean;
            BoolValue = value;
        }
    }
    public class CLobFormCell : FormCell
    {
        public CLobFormCell(int r, int c, string v, int maxr = 3, int maxc = 40)
            : base(r, c, v, CellType.CLob)
        { Rows = maxr; Cols = maxc; }
        public int Rows { get; set; }
        public int Cols { get; set; }
    }
    public class TreeCell : FormCell
    {
        public int ParentRow { get; set; }
        public int Level { get; set; }
        public bool HasChildren { get; set; }
        public TreeCell(int r, int c, string v) : base(r, c, v, CellType.Tree)
        {
            ParentRow = Level = 0;
            HasChildren = false;
        }
    }
    public class SvodForm
    {
        private const string delimiter = "_";
        private string caption;
        public bool VarRowCount { get; set; }
        public string Caption { get { return caption; } set { caption = value; } }
        public List<int> Rows { get; set; }
        public List<int> HeaderRows { get; set; }
        public List<int> Columns { get; set; }
        public Dictionary<string, HeaderCell> Header { get; }
        public Dictionary<string, FormCell> Cells { get; }
        public SvodForm(string capt)
        {
            Rows = new List<int>();
            HeaderRows = new List<int>();
            Columns = new List<int>();
            Header = new Dictionary<string, HeaderCell>();
            Cells = new Dictionary<string, FormCell>();
            caption = capt;
            VarRowCount = false;
        }
        private string cellKey(int row, int col)
        {
            return row.ToString() + delimiter + col.ToString();
        }
        public void AddHeader(HeaderCell cell)
        {
            if (!HeaderRows.Contains(cell.Row)) HeaderRows.Add(cell.Row);
            if (!Columns.Contains(cell.Column)) Columns.Add(cell.Column);
            Header.Add(cell.Row + delimiter + cell.Column, new HeaderCell(cell.Row, cell.Column, cell.Value ?? ""));
        }
        public void AddCell(FormCell cell)
        {
            if (!Rows.Contains(cell.Row)) Rows.Add(cell.Row);
            if (!Columns.Contains(cell.Column)) Columns.Add(cell.Column);
            Cells.Add(cellKey(cell.Row, cell.Column), cell);
        }
        public bool UpdateCellValue(int row, int col, string value)
        {
            string key = cellKey(row, col);
            if (Cells.ContainsKey(key))
            {
                Cells[key].Value = value;
                return true;
            }
            return false;
        }
        public void AddCells(List<FormCell> cells)
        {
            if (cells == null) return;
            foreach (FormCell cell in cells) AddCell(cell);
        }
        public void Clear()
        {
            Rows.Clear(); HeaderRows.Clear();
            Columns.Clear();
            Header.Clear();
            Cells.Clear();
        }
    }
    public class PostBackData
    {
        public string? Error { get; set; }
        public FormCell changed = new();
        public PostBackData() { Empty(); }
        public void Empty() { Error = null; changed = new FormCell(); }
    }
    public class FormCellsData
    {
        public int Percent { get; set; }
        public List<FormCell> cells=[];
        public FormCellsData() { Empty(); }
        public void Empty() { Percent = 0; cells = new List<FormCell>(); }
        public bool isEmpty() { return cells.Count == 0; }
    }
}
