<script>
    var data = "";
    function submit(e) {
        const formData = new FormData(e.target);
        console.log(formData);
        var json = Object.fromEntries(formData.entries());
        console.log(json["location"]);

        var url = "http://127.0.0.1:3000/searchLocation?location=" + encodeURI(json["location"]);
        var getRes = new XMLHttpRequest();
        
        getRes.open("GET", url, false);
        getRes.setRequestHeader("Access-Control-Allow-Origin", "*");
        getRes.send(null);
        console.log(getRes.responseText);
        data = getRes.responseText;
    }
</script>

<form on:submit|preventDefault={submit}>
    <label>
        Location
        <input name="location" type="text">
    </label> <br>
    <button>검색</button>
</form>

<pre>
    {
        JSON.stringify(data, null, 2)
    }
</pre>
