(function(){
  const originalFetch=window.fetch.bind(window);
  window.fetch=function(input,init){
    try{
      const raw=typeof input==='string'?input:input?.url;
      if(raw&&raw.includes('.supabase.co/rest/v1/')){
        const u=new URL(raw,location.href);
        u.searchParams.delete('apikey');
        input=typeof input==='string'?u.toString():new Request(u.toString(),input);
      }
    }catch(e){console.warn('fetch compatibility shim skipped',e)}
    return originalFetch(input,init);
  };
})();